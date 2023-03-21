import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { CreateDeviceRequestModel } from "@http/dtos/device/CreateDeviceRequestModel";
import { CreateDeviceResponseModel } from "@http/dtos/device/CreateDeviceResponseModel";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class CreateDeviceService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider
  ) {}

  public async execute({
    macAddress,
    nickname,
    ownerPassword,
    wifiPassword,
    wifiSsid,
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

    return {} as any;
  }
}

export { CreateDeviceService };
