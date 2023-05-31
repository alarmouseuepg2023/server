import { injectable } from "inversify";

import { ResetDevicePasswordRequestModel } from "@infra/dtos/device/ResetDevicePasswordRequestModel";

@injectable()
class ResetDevicePasswordService {
  public async execute(obj: ResetDevicePasswordRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { ResetDevicePasswordService };
