import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { getUserType2External } from "@helpers/getUserType2External";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { ChangeWifiRequestModel } from "@http/dtos/device/ChangeWifiRequestModel";
import { UpdateDeviceResponseModel } from "@http/dtos/device/UpdateDeviceResponseModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ChangeWifiService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    protected deviceRepository: IDeviceRepository,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  public async execute({
    deviceId,
    password,
    ssid,
    userId,
  }: ChangeWifiRequestModel): Promise<UpdateDeviceResponseModel> {
    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorWifiPasswordRequired"));

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

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(deviceId) ||
      !this.uniqueIdentifierProvider.isValid(userId)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasDevice, hasDeviceAccessControl] = await transaction([
      this.deviceRepository.getById({
        deviceId,
      }),
      this.deviceAccessControlRepository.getById({
        deviceId,
        userId,
      }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", i18n.__("ErrorDeviceNotFound"));

    if (!hasDeviceAccessControl)
      throw new AppError(
        "NOT_FOUND",
        i18n.__("ErrorDeviceAccessControlNotFound")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const [updated] = await transaction([
      this.deviceRepository.save({
        ...hasDevice,
        wifiSsid: ssid,
        wifiPassword: await this.hashProvider.hash(password, hashSalt),
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
      role: getUserType2External(hasDeviceAccessControl.role),
    };
  }
}

export { ChangeWifiService };
