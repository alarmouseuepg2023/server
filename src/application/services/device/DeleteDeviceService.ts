import { injectable } from "inversify";

import { DeleteDeviceRequestModel } from "@http/dtos/device/DeleteDeviceRequestModel";

@injectable()
class DeleteDeviceService {
  public async execute(obj: DeleteDeviceRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { DeleteDeviceService };
