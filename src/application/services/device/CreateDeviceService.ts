import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { CreateDeviceRequestModel } from "@http/dtos/device/CreateDeviceRequestModel";
import { CreateDeviceResponseModel } from "@http/dtos/device/CreateDeviceResponseModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class CreateDeviceService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    macAddress,
    nickname,
    ownerPassword,
    wifiPassword,
    wifiSsid,
    userId,
  }: CreateDeviceRequestModel): Promise<CreateDeviceResponseModel> {
    if (stringIsNullOrEmpty(nickname))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorNicknameRequired"));

    if (
      !this.validatorsProvider.length(
        nickname,
        VarcharMaxLength.DEVICE_NICKNAME
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorVarCharMaxLengthExceeded", [
          i18n.__("RandomWord_NickName"),
          VarcharMaxLength.DEVICE_NICKNAME,
        ])
      );

    if (stringIsNullOrEmpty(macAddress))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressRequired"));

    if (!this.validatorsProvider.macAddress(macAddress))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorMacAddressInvalid"));

    if (stringIsNullOrEmpty(wifiSsid))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorWifiSsidRequired"));

    if (
      !this.validatorsProvider.length(
        wifiSsid,
        VarcharMaxLength.DEVICE_WIFI_SSID
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorVarCharMaxLengthExceeded", [
          i18n.__("RandomWord_WifiSsid"),
          VarcharMaxLength.DEVICE_WIFI_SSID,
        ])
      );

    if (stringIsNullOrEmpty(wifiPassword))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorWifiPasswordRequired"));

    if (stringIsNullOrEmpty(ownerPassword))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorOwnerPasswordRequired"));

    if (!this.validatorsProvider.devicePassword(ownerPassword))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDevicePasswordInvalid"));

    const macAddressFormatted = this.maskProvider.removeMacAddress(macAddress);

    const [hasMacAddress] = await transaction([
      this.deviceRepository.hasMacAddress({ macAddress: macAddressFormatted }),
    ]);

    if (hasMacAddress)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorMacAddressAlreadyExists")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const id = this.uniqueIdentifierProvider.generate();

    const [deviceCreated, _] = await transaction([
      this.deviceRepository.save({
        macAddress: macAddressFormatted,
        nickname,
        wifiPassword: await this.hashProvider.hash(wifiPassword, hashSalt),
        wifiSsid,
        userId,
        status: DeviceStatusDomain.UNCONFIGURED,
        id,
      }),
      this.deviceAccessControlRepository.save({
        deviceId: id,
        userId,
        password: await this.hashProvider.hash(ownerPassword, hashSalt),
        role: RolesKeys.OWNER,
      }),
    ]);

    return {
      id: deviceCreated.id,
      macAddress: this.maskProvider.macAddress(deviceCreated.macAddress),
      nickname: deviceCreated.nickname,
      status: getEnumDescription(
        "DEVICE_STATUS",
        DeviceStatusDomain[deviceCreated.status]
      ),
    };
  }
}

export { CreateDeviceService };
