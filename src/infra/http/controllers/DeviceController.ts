import { NextFunction, Request, Response } from "express";

import { getMessage } from "@helpers/translatedMessagesControl";
import { IPaginationResponse } from "@http/models/IPaginationResponse";
import { IResponseMessage } from "@http/models/IResponseMessage";
import { HttpStatus } from "@http/utils/HttpStatus";
import { container } from "@infra/containers";
import { ChangeDeviceStatusResponseModel } from "@infra/dtos/device/ChangeDeviceStatusResponseModel";
import { CreateDeviceResponseModel } from "@infra/dtos/device/CreateDeviceResponseModel";
import { ListDevicesResponseModel } from "@infra/dtos/device/ListDevicesResponseModel";
import { UpdateDeviceResponseModel } from "@infra/dtos/device/UpdateDeviceResponseModel";
import {
  ChangeDevicePasswordService,
  ChangeDeviceStatusService,
  ChangeNicknameService,
  CreateDeviceService,
  DeleteDeviceService,
  ForgotDevicePasswordService,
  GenerateDeviceQRCodeService,
  ListDevicesService,
  NotifyAllDeviceWifiChangesHaveStartedService,
  ResetDevicePasswordService,
  UserAuthenticationAtDeviceService,
} from "@services/device";

class DeviceController {
  public async save(
    req: Request,
    res: Response<IResponseMessage<CreateDeviceResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { macAddress, ownerPassword, nickname, wifiSsid } = req.body;

    const { id: userId } = req.user;

    const service = container.resolve(CreateDeviceService);

    const result = await service.execute({
      macAddress,
      nickname,
      ownerPassword,
      wifiSsid,
      userId,
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
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async changePassword(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;
    const { password, confirmPassword, oldPassword } = req.body;

    const service = container.resolve(ChangeDevicePasswordService);

    await service.execute({
      confirmPassword,
      userId,
      password,
      oldPassword,
      deviceId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: getMessage("SuccessGeneric"),
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
    const { password, confirmPassword, pin } = req.body;

    const service = container.resolve(ResetDevicePasswordService);

    await service.execute({
      confirmPassword,
      userId,
      password,
      deviceId,
      pin,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async forgotPassword(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;

    const service = container.resolve(ForgotDevicePasswordService);

    await service.execute({
      userId,
      deviceId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async authentication(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;
    const { password } = req.body;

    const service = container.resolve(UserAuthenticationAtDeviceService);

    await service.execute({
      password,
      deviceId,
      userId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async changeStatus(
    req: Request,
    res: Response<IResponseMessage<ChangeDeviceStatusResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;
    const { status, password } = req.body;

    const service = container.resolve(ChangeDeviceStatusService);

    const result = await service.execute({
      userId,
      deviceId,
      status,
      password,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async changeNickname(
    req: Request,
    res: Response<IResponseMessage<UpdateDeviceResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;
    const { nickname } = req.body;

    const service = container.resolve(ChangeNicknameService);

    const result = await service.execute({
      nickname,
      userId,
      deviceId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async wifiChangeHaveStarted(
    req: Request,
    res: Response<IResponseMessage<ChangeDeviceStatusResponseModel>>,
    next: NextFunction
  ): Promise<void> {
    const { id: userId } = req.user;
    const { device_id: deviceId } = req.params;
    const { password } = req.body;

    const service = container.resolve(
      NotifyAllDeviceWifiChangesHaveStartedService
    );

    const result = await service.execute({
      userId,
      password,
      deviceId,
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
    const { device_id: deviceId } = req.params;

    const service = container.resolve(DeleteDeviceService);

    const result = await service.execute({
      deviceId,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      content: result,
      message: getMessage("SuccessGeneric"),
    });

    return next();
  }

  public async generateQrCode(
    req: Request,
    res: Response<IResponseMessage>,
    next: NextFunction
  ): Promise<void> {
    const { pin } = req.params;

    const { email } = req.query;

    const service = container.resolve(GenerateDeviceQRCodeService);

    const filePath = await service.execute({
      pin,
      email,
    });

    res.locals.filePath = filePath;

    res.status(HttpStatus.OK);

    return next();
  }
}

export { DeviceController };
