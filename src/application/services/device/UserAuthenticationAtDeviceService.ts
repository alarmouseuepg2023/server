import i18n from "i18n";
import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { UserAuthenticationAtDeviceRequestModel } from "@infra/dtos/device/UserAuthenticationAtDeviceRequestModel";
import { IDateProvider } from "@providers/date";
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
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider
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

    const [hasDeviceAccessControl] = await transaction([
      this.deviceAccessControlRepository.getById({ deviceId, userId }),
    ]);

    if (!hasDeviceAccessControl)
      throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceNotFound"));

    if (hasDeviceAccessControl.blocked)
      throw new AppError("UNAUTHORIZED", i18n.__("ErrorUserIsBlockedAtDevice"));

    const now = this.dateProvider.now();

    if (
      !(await this.hashProvider.compare(
        password || "",
        hasDeviceAccessControl.password
      ))
    ) {
      const attempts =
        !hasDeviceAccessControl.lastFailedUnlock ||
        this.dateProvider.isBefore(
          now,
          this.dateProvider.addMinutes(
            hasDeviceAccessControl.lastFailedUnlock,
            ConstantsKeys.MINUTES_TO_RESET_FAILED_LOGIN_ATTEMPTS_AT_DEVICE
          )
        )
          ? hasDeviceAccessControl.unlockAttempts + 1
          : 1;

      const [deviceAccessControlUpdated] = await transaction([
        this.deviceAccessControlRepository.updateControlProps({
          deviceId,
          userId,
          unlockAttempts: attempts,
          lastFailedUnlock: now,
          blocked: attempts === ConstantsKeys.MAX_LOGIN_ATTEMPTS_AT_DEVICE,
        }),
      ]);

      if (
        deviceAccessControlUpdated.unlockAttempts <
        ConstantsKeys.MAX_LOGIN_ATTEMPTS_AT_DEVICE
      )
        throw new AppError(
          "UNAUTHORIZED",
          i18n.__mf(
            "ErrorLoginAtDeviceUserUnauthorizedAndWillBeBlockedInFewAttempts",
            [
              ConstantsKeys.MAX_LOGIN_ATTEMPTS_AT_DEVICE -
                deviceAccessControlUpdated.unlockAttempts,
            ]
          )
        );

      if (deviceAccessControlUpdated.blocked)
        throw new AppError(
          "UNAUTHORIZED",
          i18n.__("ErrorLoginAtDeviceUserWillBeBlocked")
        );
    }

    await transaction([
      this.deviceAccessControlRepository.updateControlProps({
        deviceId,
        userId,
        unlockAttempts: 0,
        blocked: false,
        lastFailedUnlock: null,
      }),
    ]);
  }
}

export { UserAuthenticationAtDeviceService };
