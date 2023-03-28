import { ChangeNicknameRequestModel } from "@http/dtos/device/ChangeNicknameRequestModel";
import { UpdateDeviceResponseModel } from "@http/dtos/device/UpdateDeviceResponseModel";

class ChangeNicknameService {
  public async execute(
    obj: ChangeNicknameRequestModel
  ): Promise<UpdateDeviceResponseModel> {
    console.log(obj);

    return {} as any;
  }
}

export { ChangeNicknameService };
