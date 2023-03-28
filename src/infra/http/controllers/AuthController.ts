import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { LoginResponseModel } from "@http/dtos/auth/";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
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
      message: i18n.__("SuccessGeneric"),
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
      message: i18n.__("SuccessGeneric"),
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
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }

  public async resetPassword(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { confirmPassword, password, token } = req.body;

    const service = container.resolve(ResetPasswordService);

    const result = await service.execute({
      confirmPassword,
      password,
      token,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { AuthController };
