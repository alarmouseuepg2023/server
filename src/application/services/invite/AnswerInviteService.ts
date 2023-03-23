import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { RolesKeys } from "@commons/RolesKey";
import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { getUserType2External } from "@helpers/getUserType2External";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { AnswerInviteRequestModel } from "@http/dtos/invite/AnswerInviteRequestModel";
import { AnswerInviteResponseModel } from "@http/dtos/invite/AnswerInviteResponseModel";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IInviteRepository } from "@infra/database/repositories/invite";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class AnswerInviteService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("InviteRepository")
    private inviteRepository: IInviteRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControl: IDeviceAccessControlRepository,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    answer,
    token,
    userId,
    id,
    confirmPassword,
    password,
  }: AnswerInviteRequestModel): Promise<AnswerInviteResponseModel> {
    if (stringIsNullOrEmpty(token))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteTokenRequired"));

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(id))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteIdRequired"));

    if (stringIsNullOrEmpty(answer))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteAnswerRequired"));

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(confirmPassword))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorConfirmPasswordRequired")
      );

    if (password !== confirmPassword)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorPasswordAndConfirmAreNotEqual")
      );

    if (!this.validatorsProvider.devicePassword(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDevicePasswordInvalid"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(id)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_User")])
      );

    const [hasInvite] = await transaction([
      this.inviteRepository.getByIdAndUser({
        id,
        userId,
      }),
    ]);

    if (!hasInvite)
      throw new AppError("NOT_FOUND", i18n.__("ErrorInviteNotFound"));

    if (
      [InviteStatusDomain.ACCEPTED, InviteStatusDomain.REJECTED].includes(
        hasInvite.status
      )
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorInviteAlreadyAnswered"));

    if (!(await this.hashProvider.compare(token, hasInvite.token)))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorAnswerInviteTokenInvalid")
      );

    const now = this.dateProvider.now();

    if (
      !this.dateProvider.isBefore(
        now,
        this.dateProvider.addMinutes(
          hasInvite.invitedAt,
          ConstantsKeys.MINUTES_TO_ANSWER_INVITE
        )
      )
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorAnswerInviteExpired"));

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const [inviteUpdated, deviceAccessControlCreated] = await transaction([
      this.inviteRepository.answer({
        id,
        answeredAt: this.dateProvider.now(),
        status:
          answer === "accept"
            ? InviteStatusDomain.ACCEPTED
            : InviteStatusDomain.REJECTED,
      }),
      this.deviceAccessControl.save({
        deviceId: hasInvite.deviceId,
        password: await this.hashProvider.hash(password, hashSalt),
        role: RolesKeys.GUEST,
        userId,
      }),
    ]);

    return {
      id: inviteUpdated.id,
      answeredAt: this.maskProvider.timestamp(inviteUpdated.answeredAt as Date),
      invitedAt: this.maskProvider.timestamp(inviteUpdated.invitedAt),
      role: getUserType2External(deviceAccessControlCreated.role),
      status: getEnumDescription(
        "INVITE_STATUS",
        InviteStatusDomain[inviteUpdated.status]
      ),
    };
  }
}

export { AnswerInviteService };
