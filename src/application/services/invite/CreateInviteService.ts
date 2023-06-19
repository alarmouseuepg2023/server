import i18n from "i18n";
import { inject, injectable } from "inversify";

import { RolesKeys } from "@commons/RolesKey";
import { TopicsMQTT } from "@commons/TopicsMQTT";
import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { jsonStringify } from "@helpers/jsonStringify";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { IPushNotificationsRepository } from "@infra/database/repositories/pushNotification";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { CreateInviteRequestModel } from "@infra/dtos/invite/CreateInviteRequestModel";
import { CreateInviteResponseModel } from "@infra/dtos/invite/CreateInviteResponseModel";
import { ListInvitsResponseModel } from "@infra/dtos/invite/ListInvitsResponseModel";
import { mailTransporter } from "@infra/mail";
import { mqttClient } from "@infra/mqtt/client";
import { notificationClient } from "@infra/notifications/client";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IPasswordProvider } from "@providers/password";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class CreateInviteService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("InviteRepository")
    private inviteRepository: IInviteRepository,
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("PushNotificationsRepository")
    private pushNotificationsRepository: IPushNotificationsRepository
  ) {}

  public async execute({
    email,
    ownerId,
    deviceId,
  }: CreateInviteRequestModel): Promise<CreateInviteResponseModel> {
    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailRequired"));

    if (stringIsNullOrEmpty(ownerId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorOwnerIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(ownerId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasOwner, hasGuest] = await transaction([
      this.userRepository.getById({ id: ownerId }),
      this.userRepository.hasEmail({ email }),
    ]);

    if (!hasOwner)
      throw new AppError(
        "NOT_FOUND",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_Owner")])
      );

    if (!hasGuest)
      throw new AppError(
        "NOT_FOUND",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_Guest")])
      );

    if (ownerId === hasGuest.id)
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteToSameUser"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getById({
        deviceId,
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    const [hasRole] = await transaction([
      this.deviceAccessControlRepository.verifyRole({
        role: RolesKeys.GUEST,
        userId: hasGuest.id,
        deviceId,
      }),
    ]);

    if (hasRole)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorUserAlreadyGuestToDevice")
      );

    const token = this.passwordProvider.generatePin();

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const [inviteCreated, hasPushNotifications] = await transaction([
      this.inviteRepository.save({
        id: this.uniqueIdentifierProvider.generate(),
        deviceId,
        invitedAt: this.dateProvider.now(),
        inviterId: ownerId,
        inviteeId: hasGuest.id,
        token: await this.hashProvider.hash(token, hashSalt),
        status: InviteStatusDomain.SENT,
      }),
      this.pushNotificationsRepository.getById({ userId: hasGuest.id }),
    ]);

    if (hasPushNotifications && hasPushNotifications.notificationEnabled)
      notificationClient.send({
        token: hasPushNotifications.fcmToken,
        userId: hasGuest.id,
        notification: {
          title: i18n.__("PushNotificationSentInviteTitle"),
          body: i18n.__mf("PushNotificationSentInviteBody", [
            hasDevice.nickname,
            hasOwner.name,
          ]),
        },
      });

    mailTransporter.sendMail({
      subject: i18n.__("MailSentInviteSubject"),
      to: hasGuest.email,
      html: i18n.__mf("MailSentInviteHtml", [
        hasGuest.name,
        hasDevice.nickname,
        hasOwner.name,
        token,
      ]),
    });

    mqttClient.publish(
      TopicsMQTT.MOBILE_NOTIFICATION_INVITE(hasGuest.id),
      Buffer.from(
        jsonStringify<ListInvitsResponseModel>({
          id: inviteCreated.id,
          invitedAt: this.maskProvider.timestamp(inviteCreated.invitedAt),
          device: { nickname: hasDevice.nickname },
          inviter: { name: hasOwner.name },
        })
      )
    );

    return {
      id: inviteCreated.id,
      invitedAt: this.maskProvider.timestamp(inviteCreated.invitedAt),
      status: getEnumDescription(
        "INVITE_STATUS",
        InviteStatusDomain[inviteCreated.status]
      ),
    };
  }
}

export { CreateInviteService };
