import { injectable } from "inversify";

import { ForgotDevicePasswordRequestModel } from "@infra/dtos/device/ForgotDevicePasswordRequestModel";

@injectable()
class ForgotDevicePasswordService {
  public async execute(
    obj: ForgotDevicePasswordRequestModel
  ): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { ForgotDevicePasswordService };
