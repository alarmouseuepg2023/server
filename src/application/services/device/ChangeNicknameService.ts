import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { DeviceStatusDomain } from "@domains/DeviceStatusDomain";
import { AppError } from "@handlers/error/AppError";
import { getEnumDescription } from "@helpers/getEnumDescription";
import { getUserType2External } from "@helpers/getUserType2External";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { ChangeNicknameRequestModel } from "@http/dtos/device/ChangeNicknameRequestModel";
import { UpdateDeviceResponseModel } from "@http/dtos/device/UpdateDeviceResponseModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ChangeNicknameService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    protected deviceRepository: IDeviceRepository,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository
  ) {}

  public async execute({
    deviceId,
    nickname,
    userId,
  }: ChangeNicknameRequestModel): Promise<UpdateDeviceResponseModel> {
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

    const [updated] = await transaction([
      this.deviceRepository.save({
        ...hasDevice,
        nickname,
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

export { ChangeNicknameService };
