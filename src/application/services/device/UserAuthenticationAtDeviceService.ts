import i18n from "i18n";
import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { UserAuthenticationAtDeviceRequestModel } from "@infra/dtos/device/UserAuthenticationAtDeviceRequestModel";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class UserAuthenticationAtDeviceService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository
  ) {}

  public async execute({
    deviceId,
    password,
    userId,
  }: UserAuthenticationAtDeviceRequestModel): Promise<void> {
    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasDevice] = await transaction([
      this.deviceAccessControlRepository.getById({ deviceId, userId }),
    ]);

    if (!hasDevice)
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceNotFound"));

    if (!(await this.hashProvider.compare(password, hasDevice.password)))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorResetPasswdOldPasswordInvalid")
      );
  }
}

export { UserAuthenticationAtDeviceService };
