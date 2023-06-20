import i18n from "i18n";
import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { getMessage } from "@helpers/translatedMessagesControl";
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
    protected uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("HashProvider")
    protected hashProvider: IHashProvider,
    @inject("DeviceAccessControlRepository")
    protected deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("DateProvider")
    protected dateProvider: IDateProvider
  ) {}

  public async execute({
    deviceId,
    password,
    userId: userIdNullable,
  }: UserAuthenticationAtDeviceRequestModel): Promise<any> {
    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(userIdNullable))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceIdRequired"));

    const userId = `${userIdNullable}`;

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    const [hasDeviceAccessControl] = await transaction([
      this.deviceAccessControlRepository.getById({ deviceId, userId }),
    ]);

    if (!hasDeviceAccessControl)
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceNotFound"));

    if (hasDeviceAccessControl.blocked)
      throw new AppError(
        "UNAUTHORIZED",
        getMessage("ErrorUserIsBlockedAtDevice")
      );

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
          getMessage("ErrorLoginAtDeviceUserWillBeBlocked")
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
