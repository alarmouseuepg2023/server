import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { CreateInviteService } from "@services/invite";

class InviteController {
  public async create(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { id: ownerId } = req.user;
    const { guest_id: guestId } = req.params;

    const service = container.resolve(CreateInviteService);

    await service.execute({ guestId, ownerId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { InviteController };
