import { NextFunction, Request, Response } from "express";
import i18n from "i18n";

import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import { AnswerInviteResponseModel } from "@infra/dtos/invite/AnswerInviteResponseModel";
import { CreateInviteResponseModel } from "@infra/dtos/invite/CreateInviteResponseModel";
import { ListInvitsResponseModel } from "@infra/dtos/invite/ListInvitsResponseModel";
import {
  AcceptInviteService,
  CreateInviteService,
  ListInvitsService,
  RejectInviteService,
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

    const service = container.resolve(AcceptInviteService);

    const result = await service.execute({
      token,
      userId,
      id,
      confirmPassword,
      password,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }

  public async reject(
    req: Request,
    res: Response<IResponseMessage<AnswerInviteResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { token, id } = req.body;

    const service = container.resolve(RejectInviteService);

    const result = await service.execute({
      token,
      userId,
      id,
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
