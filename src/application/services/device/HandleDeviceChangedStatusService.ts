import { inject, injectable } from "inversify";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IPushNotificationsRepository } from "@infra/database/repositories/pushNotifications";
import { transaction } from "@infra/database/transaction";
import { ChangeDeviceStatusRequestModel } from "@infra/dtos/device/ChangeDeviceStatusRequestModel";
import { ChangeDeviceStatusResponseModel } from "@infra/dtos/device/ChangeDeviceStatusResponseModel";
import { mailTransporter } from "@infra/mail";
import { notificationClient } from "@infra/notifications/client";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

import { ChangeDeviceStatusService } from "./ChangeDeviceStatusService";

@injectable()
class HandleDeviceChangedStatusService extends ChangeDeviceStatusService {
  constructor(
    @inject("UniqueIdentifierProvider")
    uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    deviceRepository: IDeviceRepository,
    @inject("AlarmEventsRepository")
    alarmEventsRepository: IAlarmEventsRepository,
    @inject("DateProvider")
    dateProvider: IDateProvider,
    @inject("MaskProvider")
    maskProvider: IMaskProvider,
    @inject("DeviceAccessControlRepository")
    deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("HashProvider")
    hashProvider: IHashProvider,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("PushNotificationsRepository")
    private pushNotificationsRepository: IPushNotificationsRepository
  ) {
    super(
      uniqueIdentifierProvider,
      deviceRepository,
      alarmEventsRepository,
      dateProvider,
      maskProvider,
      deviceAccessControlRepository,
      hashProvider
    );
  }

  protected canChangeToAnyStatus = (): boolean => true;

  protected userRequired = (): boolean => false;

  protected saveWaitingAckStatus = (): boolean => false;

  public async execute({
    deviceId,
    status,
  }: Partial<ChangeDeviceStatusRequestModel>): Promise<ChangeDeviceStatusResponseModel> {
    if (stringIsNullOrEmpty(deviceId || ""))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceIdRequired"));

    if (!this.validatorsProvider.macAddress(deviceId || ""))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getByMacAddress({
        macAddress: this.maskProvider.removeMacAddress(deviceId || ""),
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", getMessage("ErrorDeviceNotFound"));

    const result = await super.execute({
      userId: null,
      deviceId: hasDevice.id,
      status: `${status}`,
      password: null,
    });

    if (
      result.status ===
      getEnumDescription("DEVICE_STATUS", DeviceStatusDomain[3])
    ) {
      const [receivers] = await transaction([
        this.pushNotificationsRepository.getByDevice({
          deviceId: hasDevice.id,
        }),
      ]);

      notificationClient.sendAll(receivers, {
        title: getMessage("PushNotificationDeviceTriggeredTitle"),
        body: getVariableMessage("PushNotificationDeviceTriggeredBody", [
          hasDevice.nickname,
          result.alarmEvent.createdAt,
        ]),
      });

      mailTransporter.sendMail({
        subject: getMessage("MailSentNotificationDeviceTriggeredSubject"),
        to: hasDevice.owner.email,
        html: getVariableMessage("MailSentNotificationDeviceTriggeredHtml", [
          hasDevice.nickname,
          result.alarmEvent.createdAt,
        ]),
      });
    }

    return result;
  }
}

export { HandleDeviceChangedStatusService };
