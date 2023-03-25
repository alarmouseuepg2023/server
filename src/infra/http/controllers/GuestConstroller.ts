import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { RevokeGuestPermissionService } from "@services/guest";

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
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { GuestController };
