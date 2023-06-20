import { inject, injectable } from "inversify";

import { RolesKeys } from "@commons/RolesKey";
import { TopicsMQTT } from "@commons/TopicsMQTT";
import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { getUserType2External } from "@helpers/getUserType2External";
import { jsonStringify } from "@helpers/jsonStringify";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { IAlarmEventsRepository } from "@infra/database/repositories/alarmEvents";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { ChangeDeviceStatusMobileNotificationModel } from "@infra/dtos/device/ChangeDeviceStatusMobileNotificationModel";
import { ChangeWifiRequestModel } from "@infra/dtos/device/ChangeWifiRequestModel";
import { UpdateDeviceResponseModel } from "@infra/dtos/device/UpdateDeviceResponseModel";
import { mqttClient } from "@infra/mqtt/client";
import { IDateProvider } from "@providers/date";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class HandleDeviceChangedWifiService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("AlarmEventsRepository")
    private alarmEventsRepository: IAlarmEventsRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider
  ) {}

  public async execute({
    macAddress,
    ssid,
  }: ChangeWifiRequestModel): Promise<UpdateDeviceResponseModel> {
    if (stringIsNullOrEmpty(ssid))
      throw new AppError("BAD_REQUEST", getMessage("ErrorWifiSsidRequired"));

    if (
      !this.validatorsProvider.length(ssid, VarcharMaxLength.DEVICE_WIFI_SSID)
    )
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorVarCharMaxLengthExceeded", [
          getMessage("RandomWord_WifiSsid"),
          VarcharMaxLength.DEVICE_WIFI_SSID,
        ])
      );

    if (stringIsNullOrEmpty(macAddress))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressRequired"));

    if (!this.validatorsProvider.macAddress(macAddress))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getByMacAddress({
        macAddress: this.maskProvider.removeMacAddress(macAddress),
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", getMessage("ErrorDeviceNotFound"));

    const deviceId = hasDevice.id;
    const unlocked = DeviceStatusDomain.UNLOCKED;

    const [updated, _] = await transaction([
      this.deviceRepository.save({
        ...hasDevice,
        status: unlocked,
        wifiSsid: ssid,
        userId: "",
      }),
      this.alarmEventsRepository.save({
        deviceId,
        userId: hasDevice.owner.id,
        currentStatus: unlocked,
        message: getVariableMessage("AlarmEvents_ChangeStatus", [
          getEnumDescription(
            "DEVICE_STATUS",
            DeviceStatusDomain[hasDevice.status as number]
          ),
          getEnumDescription("DEVICE_STATUS", DeviceStatusDomain[unlocked]),
        ]),
        createdAt: this.dateProvider.now(),
        id: this.uniqueIdentifierProvider.generate(),
      }),
    ]);

    mqttClient.publish(
      TopicsMQTT.MOBILE_NOTIFICATION_STATUS_CHANGED,
      Buffer.from(
        jsonStringify<ChangeDeviceStatusMobileNotificationModel>({
          status: unlocked,
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
      role: getUserType2External(RolesKeys.OWNER),
    };
  }
}

export { HandleDeviceChangedWifiService };
