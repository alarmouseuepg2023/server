import { inject, injectable } from "inversify";

import { getMessage } from "@helpers/translatedMessagesControl";
import { IMiddleware } from "@http/models/IMiddleware";
import { HttpStatus } from "@http/utils/HttpStatus";
import { IAuthTokenProvider } from "@providers/authToken";

@injectable()
class EnsureUserAuthenticatedMiddleware {
  constructor(
    @inject("AuthTokenProvider")
    private authTokenProvider: IAuthTokenProvider
  ) {}

  public execute: IMiddleware = async (req, res, next) => {
    try {
      const tokenHeader = req.headers.authorization;

      if (!tokenHeader)
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: getMessage("ErrorAuthTokenInvalid"),
        });

      const parts = tokenHeader.split(" ");
      const [scheme, token] = parts;

      if (parts.length !== 2 || !/^Bearer$/i.test(scheme))
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: getMessage("ErrorAuthTokenInvalid"),
        });

      const payload = this.authTokenProvider.decode(token);

      if (!payload)
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: getMessage("ErrorAuthTokenInvalid"),
        });

      if (payload.exp && Date.now() >= payload.exp * 1000)
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: getMessage("ErrorAuthTokenExpired"),
        });

      if (payload.type === "refreshToken")
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: getMessage("ErrorAuthTokenInvalid"),
        });

      if (!this.authTokenProvider.verify(token, "accessToken"))
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: getMessage("ErrorAuthTokenInvalid"),
        });

      Object.assign(req, { user: { id: payload.id } });

      return next();
    } catch (_) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: getMessage("ErrorAuthTokenInvalid"),
      });
    }
  };
}

export { EnsureUserAuthenticatedMiddleware };
