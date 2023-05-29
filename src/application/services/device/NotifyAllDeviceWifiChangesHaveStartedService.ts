import { inject, injectable } from "inversify";

import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { ChangeDeviceStatusRequestModel } from "@infra/dtos/device/ChangeDeviceStatusRequestModel";
import { ChangeDeviceStatusResponseModel } from "@infra/dtos/device/ChangeDeviceStatusResponseModel";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

import { ChangeDeviceStatusService } from "./ChangeDeviceStatusService";

@injectable()
class NotifyAllDeviceWifiChangesHaveStartedService extends ChangeDeviceStatusService {
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
    hashProvider: IHashProvider
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

  protected userRequired = (): boolean => true;

  protected saveWaitingAckStatus = (): boolean => false;

  public async execute({
    deviceId,
    userId,
    password,
  }: Partial<ChangeDeviceStatusRequestModel>): Promise<ChangeDeviceStatusResponseModel> {
    const result = await super.execute({
      userId: `${userId}`,
      deviceId: `${deviceId}`,
      password: `${password}`,
      status: `${DeviceStatusDomain.UNCONFIGURED}`,
    });

    return result;
  }
}

export { NotifyAllDeviceWifiChangesHaveStartedService };
