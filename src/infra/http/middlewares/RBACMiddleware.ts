import i18n from "i18n";
import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { IMiddleware } from "@http/models/IMiddleware";
import { HttpStatus } from "@http/utils/HttpStatus";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { transaction } from "@infra/database/transaction";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IDeviceAccessControlRepository } from "@repositories/deviceAccessControl";

@injectable()
class RBACMiddleware {
  constructor(
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider
  ) {}

  public is =
    (role: string | undefined, deviceIdParamName = "device_id"): IMiddleware =>
    async (req, res, next) => {
      const { id } = req.user;
      const { [`${deviceIdParamName}`]: deviceId } = req.params;

      if (!this.uniqueIdentifierProvider.isValid(deviceId))
        throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

      const [hasDevice, hasRole] = await transaction([
        this.deviceRepository.getById({ deviceId }),
        this.deviceAccessControlRepository.verifyRole({
          role,
          userId: id,
          deviceId,
        }),
      ]);

      if (!hasDevice)
        throw new AppError("BAD_REQUEST", i18n.__("ErrorDeviceNotFound"));

      if (!hasRole)
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: i18n.__("ErrorUnauthorizedUserForThisResource"),
        });

      return next();
    };

  public has = (deviceIdParamName = "device_id"): IMiddleware =>
    this.is(undefined, deviceIdParamName);
}

export { RBACMiddleware };
