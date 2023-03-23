import { NextFunction, Request, Response } from "express";
import i18n from "i18n";
import { container } from "tsyringe";

import { CreateDeviceResponseModel } from "@http/dtos/device/CreateDeviceResponseModel";
import { ListDevicesResponseModel } from "@http/dtos/device/ListDevicesResponseModel";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import {
  CreateDeviceService,
  ListDevicesService,
  ResetDevicePasswordService,
} from "@services/device";

class DeviceController {
  public async save(
    req: Request,
    res: Response<IResponseMessage<CreateDeviceResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { macAddress, ownerPassword, nickname, wifiSsid, wifiPassword } =
      req.body;

    const { id: userId } = req.user;

    const service = container.resolve(CreateDeviceService);

    const result = await service.execute({
      macAddress,
      nickname,
      ownerPassword,
      wifiPassword,
      wifiSsid,
      userId,
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
      IResponseMessage<IPaginationResponse<ListDevicesResponseModel>>
    >,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { size, page } = req.query;

    const service = container.resolve(ListDevicesService);

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

  public async resetPassword(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;
    const { password, confirmPassword, oldPassword } = req.body;

    const service = container.resolve(ResetDevicePasswordService);

    await service.execute({
      confirmPassword,
      userId,
      password,
      oldPassword,
      deviceId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: i18n.__("SuccessGeneric"),
    });

    return next();
  }
}

export { DeviceController };
