import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { getMessage } from "@helpers/translatedMessagesControl";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { ChangeDevicePasswordRequestModel } from "@infra/dtos/device/ChangeDevicePasswordRequestModel";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ChangeDevicePasswordService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider
  ) {}

  public async execute({
    confirmPassword,
    password,
    oldPassword,
    userId,
    deviceId,
  }: ChangeDevicePasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(oldPassword))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorResetPasswdOldPasswordRequired")
      );

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(confirmPassword))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorConfirmPasswordRequired")
      );

    if (password !== confirmPassword)
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorPasswordAndConfirmAreNotEqual")
      );

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    if (!this.validatorsProvider.devicePassword(password))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorDevicePasswordInvalid")
      );

    const [hasDevice] = await transaction([
      this.deviceAccessControlRepository.getById({ deviceId, userId }),
    ]);

    if (!hasDevice)
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceNotFound"));

    if (!(await this.hashProvider.compare(oldPassword, hasDevice.password)))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorResetPasswdOldPasswordInvalid")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: "ErrorEnvVarNotFound",
    });

    const [updated] = await transaction([
      this.deviceAccessControlRepository.updatePassword({
        deviceId,
        userId,
        password: await this.hashProvider.hash(password, hashSalt),
      }),
    ]);

    return !!updated;
  }
}

export { ChangeDevicePasswordService };
