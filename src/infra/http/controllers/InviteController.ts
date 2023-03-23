import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { AnswerInviteResponseModel } from "@http/dtos/invite/AnswerInviteResponseModel";
import { CreateInviteResponseModel } from "@http/dtos/invite/CreateInviteResponseModel";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { AnswerInviteService, CreateInviteService } from "@services/invite";

class InviteController {
  public async create(
    req: Request,
    res: Response<IResponseMessage<CreateInviteResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { id: ownerId } = req.user;
    const { guestId, deviceId } = req.body;

    const service = container.resolve(CreateInviteService);

    const result = await service.execute({ guestId, ownerId, deviceId });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }

  public async accept(
    req: Request,
    res: Response<IResponseMessage<AnswerInviteResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { token, id, password, confirmPassword } = req.body;

    const service = container.resolve(AnswerInviteService);

    const result = await service.execute({
      token,
      userId,
      id,
      confirmPassword,
      password,
      answer: "accept",
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { InviteController };
