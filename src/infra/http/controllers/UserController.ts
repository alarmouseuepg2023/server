import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { CreateUserResponseModel } from "@http/dtos/user/CreateUserResponseModel";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { CreateUserService } from "@services/user";

class UserController {
  public async create(
    req: Request,
    res: Response<IResponseMessage<CreateUserResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { password, confirmPassword, email, name } = req.body;

    const service = container.resolve(CreateUserService);

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
}

export { UserController };
