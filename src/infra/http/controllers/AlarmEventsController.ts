import { NextFunction, Request, Response } from "express";
import i18n from "i18n";

import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import { ListAlarmEventsResponseModel } from "@infra/dtos/alarmEvents/ListAlarmEventsResponseModel";
import { ListAlarmEventsService } from "@services/alarmEvents";

class AlarmEventsController {
  public async list(
    req: Request,
    res: Response<
      IResponseMessage<IPaginationResponse<ListAlarmEventsResponseModel>>
    >,
    next: NextFunction
  ): Promise<void> {
    const { device_id: deviceId } = req.params;
    const { size, page } = req.query;

    const service = container.resolve(ListAlarmEventsService);

    const result = await service.execute({
      deviceId,
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

export { AlarmEventsController };
