import { inject, injectable } from "inversify";

import { TopicsMQTT } from "@commons/TopicsMQTT";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { jsonStringify } from "@helpers/jsonStringify";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { ChangeDeviceStatusMobileNotificationModel } from "@infra/dtos/device/ChangeDeviceStatusMobileNotificationModel";
import { ChangeDeviceStatusRequestModel } from "@infra/dtos/device/ChangeDeviceStatusRequestModel";
import { ChangeDeviceStatusResponseModel } from "@infra/dtos/device/ChangeDeviceStatusResponseModel";
import { mqttClient } from "@infra/mqtt/client";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

import { UserAuthenticationAtDeviceService } from "./UserAuthenticationAtDeviceService";

@injectable()
class ChangeDeviceStatusService extends UserAuthenticationAtDeviceService {
  constructor(
    @inject("UniqueIdentifierProvider")
    uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    protected deviceRepository: IDeviceRepository,
    @inject("AlarmEventsRepository")
    private alarmEventsRepository: IAlarmEventsRepository,
    @inject("DateProvider")
    dateProvider: IDateProvider,
    @inject("MaskProvider")
    protected maskProvider: IMaskProvider,
    @inject("DeviceAccessControlRepository")
    deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("HashProvider")
    hashProvider: IHashProvider
  ) {
    super(
      uniqueIdentifierProvider,
      hashProvider,
      deviceAccessControlRepository,
      dateProvider
    );
  }

  protected canChangeToAnyStatus = (): boolean => false;

  protected userRequired = (): boolean => true;

  protected saveWaitingAckStatus = (): boolean => true;

  public async execute({
    deviceId,
    status,
    userId,
    password,
  }: ChangeDeviceStatusRequestModel): Promise<ChangeDeviceStatusResponseModel> {
    if (this.userRequired()) {
      await super.execute({
        deviceId,
        password,
        userId,
      });
    }

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceIdRequired"));

    if (stringIsNullOrEmpty(status))
      throw new AppError("BAD_REQUEST", getMessage("ErrorStatusRequired"));

    const statusConverted = toNumber({
      value: status,
      error: getMessage("ErrorStatusInvalid"),
    });

    if (!(statusConverted in DeviceStatusDomain))
      throw new AppError("BAD_REQUEST", getMessage("ErrorStatusOutOfDomain"));

    if (
      !this.canChangeToAnyStatus() &&
      [DeviceStatusDomain.TRIGGERED, DeviceStatusDomain.UNCONFIGURED].includes(
        statusConverted
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorCantUpdateDeviceStatus")
      );

    if (!this.uniqueIdentifierProvider.isValid(deviceId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getById({
        deviceId,
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", getMessage("ErrorDeviceNotFound"));

    if (hasDevice.status === statusConverted)
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorUpdateDeviceWithoutChangeStatus", [
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[statusConverted]
          ),
        ])
      );

    const status2save = this.saveWaitingAckStatus()
      ? DeviceStatusDomain.WAITING_ACK
      : statusConverted;

    const [updated, alarmEventCreated] = await transaction([
      this.deviceRepository.updateStatus({ deviceId, status: status2save }),
      this.alarmEventsRepository.save({
        deviceId,
        userId,
        currentStatus: status2save,
        message: getVariableMessage("AlarmEvents_ChangeStatus", [
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[hasDevice.status as number]
          ),
          getEnumDescription("DEVICE_STATUS", DeviceStatusDomain[status2save]),
        ]),
        createdAt: this.dateProvider.now(),
        id: this.uniqueIdentifierProvider.generate(),
      }),
    ]);

    if (this.saveWaitingAckStatus())
      mqttClient.publish(
        TopicsMQTT.EMBEDDED_WAITING_ACK_ON_CHANGED_STATUS(
          this.maskProvider.macAddress(hasDevice.macAddress)
        ),
        Buffer.from(`${statusConverted}`)
      );

    mqttClient.publish(
      TopicsMQTT.MOBILE_NOTIFICATION_STATUS_CHANGED,
      Buffer.from(
        jsonStringify<ChangeDeviceStatusMobileNotificationModel>({
          status: status2save,
          macAddress: this.maskProvider.macAddress(hasDevice.macAddress),
        })
      )
    );

    return {
      id: updated.id,
      nickname: updated.nickname,
      status: getEnumDescription(
        "DEVICE_STATUS",
        DeviceStatusDomain[updated.status]
      ),
      alarmEvent: {
        message: alarmEventCreated.message,
        createdAt: this.maskProvider.timestamp(alarmEventCreated.createdAt),
      },
    };
  }
}

export { ChangeDeviceStatusService };
