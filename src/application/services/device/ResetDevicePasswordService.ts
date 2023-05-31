import i18n from "i18n";
import { inject, injectable } from "inversify";

import { OperationsWithEmailConfirmationDomain } from "@domains/OperationsWithEmailConfirmationDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
import { ResetDevicePasswordRequestModel } from "@infra/dtos/device/ResetDevicePasswordRequestModel";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ResetDevicePasswordService {
  constructor(
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider
  ) {}

  public async execute({
    confirmPassword,
    deviceId,
    password,
    pin,
    userId,
  }: ResetDevicePasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    if (stringIsNullOrEmpty(pin))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPinRequired"));

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(confirmPassword))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorConfirmPasswordRequired")
      );

    if (password !== confirmPassword)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorPasswordAndConfirmAreNotEqual")
      );

    if (!this.validatorsProvider.devicePassword(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDevicePasswordInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "NOT_FOUND",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_User")])
      );

    const [hasRequest] = await transaction([
      this.waitingEmailConfirmationRepository.getById({
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.RESET_DEVICE_PASSWORD,
      }),
    ]);

    if (!hasRequest)
      throw new AppError(
        "NOT_FOUND",
        i18n.__("ErrorResetPasswordRequestNotFound")
      );

    if (!(await this.hashProvider.compare(pin, hasRequest.pin)))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorResetPasswordRequestPinInvalid")
      );

    if (
      this.dateProvider.isBefore(hasRequest.expiresIn, this.dateProvider.now())
    )
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorResetPasswordRequestTimeExpired")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const [userUpdated, _] = await transaction([
      this.deviceAccessControlRepository.updatePassword({
        deviceId,
        userId,
        password: await this.hashProvider.hash(password, hashSalt),
      }),
      this.waitingEmailConfirmationRepository.delete({
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.RESET_DEVICE_PASSWORD,
      }),
    ]);

    return !!userUpdated;
  }
}

export { ResetDevicePasswordService };
