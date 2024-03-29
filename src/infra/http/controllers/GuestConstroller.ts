import { NextFunction, Request, Response } from "express";

import { getMessage } from "@helpers/translatedMessagesControl";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import { ListGuestsResponseModel } from "@infra/dtos/guest/ListGuestsResponseModel";
import {
  GuestExitService,
  ListGuestsService,
  RevokeGuestPermissionService,
} from "@services/guest";

class GuestController {
  public async revokePermission(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { device_id: deviceId } = req.params;
    const { guestId } = req.body;

    const service = container.resolve(RevokeGuestPermissionService);

    const result = await service.execute({
      deviceId,
      guestId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async guestExit(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;

    const service = container.resolve(GuestExitService);

    const result = await service.execute({
      deviceId,
      guestId: userId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async list(
    req: Request,
    res: Response<
      IResponseMessage<IPaginationResponse<ListGuestsResponseModel>>
    >,
    next: NextFunction
  ): Promise<void> {
    const { device_id: deviceId } = req.params;
    const { size, page } = req.query;

    const service = container.resolve(ListGuestsService);

    const result = await service.execute({
      deviceId,
      size,
      page,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }
}

export { GuestController };
