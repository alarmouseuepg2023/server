import { NextFunction, Request, Response } from "express";
import i18n from "i18n";

import { CreateBlockedUserResponseModel } from "@http/dtos/user/CreateBlockedUserResponseModel";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import {
  ChangePasswordService,
  ConfirmDeletionService,
  BlockedUserCreationService,
  RequestDeletionService,
} from "@services/user";

class UserController {
  public async createBlocked(
    req: Request,
    res: Response<IResponseMessage<CreateBlockedUserResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { password, confirmPassword, email, name } = req.body;

    const service = container.resolve(BlockedUserCreationService);

    const result = await service.execute({
      confirmPassword,
      email,
      name,
      password,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }

  public async changePassword(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { password, confirmPassword, oldPassword } = req.body;

    const service = container.resolve(ChangePasswordService);

    await service.execute({
      confirmPassword,
      userId,
      password,
      oldPassword,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }

  public async requestDeletion(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;

    const service = container.resolve(RequestDeletionService);

    const result = await service.execute({
      userId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }

  public async confirmDeletion(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { pin } = req.params;

    const service = container.resolve(ConfirmDeletionService);

    const result = await service.execute({
      pin,
      userId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { UserController };
