import { NextFunction, Request, Response } from "express";

import { getMessage } from "@helpers/translatedMessagesControl";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import { UpdatePushNotificationFCMTokenResponseModel } from "@infra/dtos/pushNotifications/UpdatePushNotificationFCMTokenResponseModel";
import {
  DeletePushNotificationService,
  UpdatePushNotificationFCMTokenService,
} from "@services/pushNotifications";

class PushNotificationsController {
  public async updateToken(
    req: Request,
    res: Response<
      IResponseMessage<UpdatePushNotificationFCMTokenResponseModel>
    >,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { token } = req.body;

    const service = container.resolve(UpdatePushNotificationFCMTokenService);

    const result = await service.execute({
      token,
      userId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async delete(
    req: Request,
    res: Response<IResponseMessage<boolean>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;

    const service = container.resolve(DeletePushNotificationService);

    const result = await service.execute({
      userId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }
}

export { PushNotificationsController };
