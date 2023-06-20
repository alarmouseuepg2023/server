import { NextFunction, Request, Response } from "express";

import { getMessage } from "@helpers/translatedMessagesControl";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import { LoginResponseModel } from "@infra/dtos/auth";
import {
  ForgotPasswordService,
  LoginService,
  RefreshTokenService,
  ResetPasswordService,
} from "@services/auth";

class AuthController {
  public async login(
    req: Request,
    res: Response<IResponseMessage<LoginResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { email, password } = req.body;

    const service = container.resolve(LoginService);

    const result = await service.execute({ email, password });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async refreshToken(
    req: Request,
    res: Response<IResponseMessage<LoginResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { refreshToken } = req.body;

    const service = container.resolve(RefreshTokenService);

    const result = await service.execute(refreshToken);

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async forgotPassword(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { email } = req.body;

    const service = container.resolve(ForgotPasswordService);

    const result = await service.execute({
      email,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async resetPassword(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { confirmPassword, password, pin, email } = req.body;

    const service = container.resolve(ResetPasswordService);

    const result = await service.execute({
      confirmPassword,
      password,
      email,
      pin,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }
}

export { AuthController };
