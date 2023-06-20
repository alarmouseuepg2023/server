import { inject, injectable } from "inversify";

import { RolesKeys } from "@commons/RolesKey";
import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { CreateDeviceRequestModel } from "@infra/dtos/device/CreateDeviceRequestModel";
import { CreateDeviceResponseModel } from "@infra/dtos/device/CreateDeviceResponseModel";
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
    wifiSsid,
    userId,
  }: CreateDeviceRequestModel): Promise<CreateDeviceResponseModel> {
    if (stringIsNullOrEmpty(nickname))
      throw new AppError("BAD_REQUEST", getMessage("ErrorNicknameRequired"));

    if (
      !this.validatorsProvider.length(
        nickname,
        VarcharMaxLength.DEVICE_NICKNAME
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorVarCharMaxLengthExceeded", [
          getMessage("RandomWord_NickName"),
          VarcharMaxLength.DEVICE_NICKNAME,
        ])
      );

    if (stringIsNullOrEmpty(macAddress))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressRequired"));

    if (!this.validatorsProvider.macAddress(macAddress))
      throw new AppError("BAD_REQUEST", getMessage("ErrorMacAddressInvalid"));

    if (stringIsNullOrEmpty(wifiSsid))
      throw new AppError("BAD_REQUEST", getMessage("ErrorWifiSsidRequired"));

    if (
      !this.validatorsProvider.length(
        wifiSsid,
        VarcharMaxLength.DEVICE_WIFI_SSID
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorVarCharMaxLengthExceeded", [
          getMessage("RandomWord_WifiSsid"),
          VarcharMaxLength.DEVICE_WIFI_SSID,
        ])
      );

    if (stringIsNullOrEmpty(ownerPassword))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorOwnerPasswordRequired")
      );

    if (!this.validatorsProvider.devicePassword(ownerPassword))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorDevicePasswordInvalid")
      );

    const macAddressFormatted = this.maskProvider.removeMacAddress(macAddress);

    const [hasMacAddress] = await transaction([
      this.deviceRepository.hasMacAddress({ macAddress: macAddressFormatted }),
    ]);

    if (hasMacAddress)
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorMacAddressAlreadyExists")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: getMessage("ErrorEnvVarNotFound"),
    });

    const id = this.uniqueIdentifierProvider.generate();

    const [deviceCreated, _] = await transaction([
      this.deviceRepository.save({
        macAddress: macAddressFormatted,
        nickname,
        wifiSsid,
        userId,
        status: DeviceStatusDomain.UNLOCKED,
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
