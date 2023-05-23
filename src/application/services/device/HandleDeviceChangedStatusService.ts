import i18n from "i18n";
import { inject, injectable } from "inversify";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { ChangeDeviceStatusRequestModel } from "@infra/dtos/device/ChangeDeviceStatusRequestModel";
import { ChangeDeviceStatusResponseModel } from "@infra/dtos/device/ChangeDeviceStatusResponseModel";
import { mailTransporter } from "@infra/mail";
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
    @inject("UserRepository")
    userRepository: IUserRepository,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider
  ) {
    super(
      uniqueIdentifierProvider,
      deviceRepository,
      alarmEventsRepository,
      dateProvider,
      maskProvider,
      deviceAccessControlRepository,
      hashProvider,
      userRepository
    );
  }

  protected canChangeToAnyStatus = (): boolean => false;

  protected userRequired = (): boolean => false;

  protected saveWaitingAckStatus = (): boolean => false;

  public async execute({
    deviceId,
    status,
  }: Partial<ChangeDeviceStatusRequestModel>): Promise<ChangeDeviceStatusResponseModel> {
    if (stringIsNullOrEmpty(deviceId || ""))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (!this.validatorsProvider.macAddress(deviceId || ""))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getByMacAddress({
        macAddress: this.maskProvider.removeMacAddress(deviceId || ""),
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    const result = await super.execute({
      userId: null,
      deviceId: hasDevice.id,
      status: `${status}`,
      password: null,
    });

    if (
      result.status ===
      getEnumDescription("DEVICE_STATUS", DeviceStatusDomain[3])
    )
      mailTransporter.sendMail({
        subject: i18n.__("MailSentNotificationDeviceTriggeredSubject"),
        to: hasDevice.owner.email,
        html: i18n.__mf("MailSentNotificationDeviceTriggeredHtml", [
          hasDevice.nickname,
          result.alarmEvent.createdAt,
        ]),
      });

    return result;
  }
}

export { HandleDeviceChangedStatusService };
