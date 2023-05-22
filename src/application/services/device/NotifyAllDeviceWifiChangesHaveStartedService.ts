import i18n from "i18n";
import { inject, injectable } from "inversify";

import { TopicsMQTT } from "@commons/TopicsMQTT";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { DeviceWifiChangesHaveStartedRequestModel } from "@infra/dtos/device/DeviceWifiChangesHaveStartedRequestModel";
import { mqttClient } from "@infra/mqtt/client";
import { IDateProvider } from "@providers/date";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class NotifyAllDeviceWifiChangesHaveStartedService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("AlarmEventsRepository")
    private alarmEventsRepository: IAlarmEventsRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    deviceId,
    userId,
  }: DeviceWifiChangesHaveStartedRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(deviceId) ||
      !this.uniqueIdentifierProvider.isValid(userId)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getById({
        deviceId,
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    const unconfigured = DeviceStatusDomain.UNCONFIGURED;

    if (hasDevice.status === unconfigured)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorUpdateDeviceWithoutChangeStatus", [
          getEnumDescription("DEVICE_STATUS", DeviceStatusDomain[unconfigured]),
        ])
      );

    const [statusUpdated, _] = await transaction([
      this.deviceRepository.updateStatus({
        deviceId,
        status: unconfigured,
      }),
      this.alarmEventsRepository.save({
        deviceId,
        userId,
        currentStatus: unconfigured,
        message: i18n.__mf("AlarmEvents_ChangeStatus", [
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[hasDevice.status as number]
          ),
          getEnumDescription("DEVICE_STATUS", DeviceStatusDomain[unconfigured]),
        ]),
        createdAt: this.dateProvider.now(),
        id: this.uniqueIdentifierProvider.generate(),
      }),
    ]);

    mqttClient.publish(
      TopicsMQTT.ALL_PUB_CHANGE_DEVICE_STATUS(
        this.maskProvider.macAddress(hasDevice.macAddress)
      ),
      Buffer.from(`${unconfigured}`)
    );

    return !!statusUpdated;
  }
}

export { NotifyAllDeviceWifiChangesHaveStartedService };
