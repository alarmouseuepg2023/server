import { ChangeWifiRequestModel } from "@http/dtos/device/ChangeWifiRequestModel";
import { UpdateDeviceResponseModel } from "@http/dtos/device/UpdateDeviceResponseModel";

class ChangeWifiService {
  public async execute(
    obj: ChangeWifiRequestModel
  ): Promise<UpdateDeviceResponseModel> {
    console.log(obj);

    return {} as any;
  }
}

export { ChangeWifiService };
