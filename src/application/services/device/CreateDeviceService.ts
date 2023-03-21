import { CreateDeviceRequestModel } from "@http/dtos/device/CreateDeviceRequestModel";
import { CreateDeviceResponseModel } from "@http/dtos/device/CreateDeviceResponseModel";

class CreateDeviceService {
  public async execute(
    obj: CreateDeviceRequestModel
  ): Promise<CreateDeviceResponseModel> {
    console.log(obj);
    return {} as any;
  }
}

export { CreateDeviceService };
