import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { IMiddleware } from "@http/models/IMiddleware";
import { HttpStatus } from "@http/utils/HttpStatus";
import { transaction } from "@infra/database/transaction";
import { IUserRepository } from "@repositories/user";

@injectable()
class RBACMiddleware {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository
  ) {}

  public is =
    (role: string | undefined, deviceIdParamName = "device_id"): IMiddleware =>
    async (req, res, next) => {
      const { id } = req.user;
      const { [`${deviceIdParamName}`]: deviceId } = req.params;

      const [hasRole] = await transaction([
        this.userRepository.verifyRole({
          role,
          userId: id,
          deviceId,
        }),
      ]);

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
