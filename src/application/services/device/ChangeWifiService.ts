import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { getUserType2External } from "@helpers/getUserType2External";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { ChangeWifiRequestModel } from "@http/dtos/device/ChangeWifiRequestModel";
import { UpdateDeviceResponseModel } from "@http/dtos/device/UpdateDeviceResponseModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { IMaskProvider } from "@providers/mask";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ChangeWifiService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    macAddress,
    ssid,
  }: ChangeWifiRequestModel): Promise<UpdateDeviceResponseModel> {
    if (stringIsNullOrEmpty(ssid))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorWifiSsidRequired"));

    if (
      !this.validatorsProvider.length(ssid, VarcharMaxLength.DEVICE_WIFI_SSID)
    )
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorVarCharMaxLengthExceeded", [
          i18n.__("RandomWord_WifiSsid"),
          VarcharMaxLength.DEVICE_WIFI_SSID,
        ])
      );

    if (stringIsNullOrEmpty(macAddress))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressRequired"));

    if (!this.validatorsProvider.macAddress(macAddress))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressInvalid"));

    const [hasDevice] = await transaction([
      this.deviceRepository.getByMacAddress({
        macAddress: this.maskProvider.removeMacAddress(macAddress),
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    const [updated] = await transaction([
      this.deviceRepository.save({
        ...hasDevice,
        wifiSsid: ssid,
        userId: "",
      }),
    ]);

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

export { ChangeWifiService };
