import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { AnswerInviteResponseModel } from "@http/dtos/invite/AnswerInviteResponseModel";
import { CreateInviteResponseModel } from "@http/dtos/invite/CreateInviteResponseModel";
import { ListInvitsResponseModel } from "@http/dtos/invite/ListInvitsResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import {
  AnswerInviteService,
  CreateInviteService,
  ListInvitsService,
} from "@services/invite";

class InviteController {
  public async create(
    req: Request,
    res: Response<IResponseMessage<CreateInviteResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { email } = req.body;
    const { device_id: deviceId } = req.params;
    const { id: ownerId } = req.user;

    const service = container.resolve(CreateInviteService);

    const result = await service.execute({ email, ownerId, deviceId });

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

  public async list(
    req: Request,
    res: Response<
      IResponseMessage<IPaginationResponse<ListInvitsResponseModel>>
    >,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { size, page } = req.query;

    const service = container.resolve(ListInvitsService);

    const result = await service.execute({
      userId,
      size,
      page,
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
