import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { CreateDeviceResponseModel } from "@http/dtos/device/CreateDeviceResponseModel";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { CreateDeviceService } from "@services/device";

class DeviceController {
  public async save(
    req: Request,
    res: Response<IResponseMessage<CreateDeviceResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { macAddress, ownerPassword, nickname, wifiSsid, wifiPassword } =
      req.body;

    const service = container.resolve(CreateDeviceService);

    const result = await service.execute({
      macAddress,
      nickname,
      ownerPassword,
      wifiPassword,
      wifiSsid,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { DeviceController };
