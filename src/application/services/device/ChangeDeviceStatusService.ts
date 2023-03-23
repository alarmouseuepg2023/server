import { ChangeDeviceStatusRequestModel } from "@http/dtos/device/ChangeDeviceStatusRequestModel";

class ChangeDeviceStatusService {
  public async execute(obj: ChangeDeviceStatusRequestModel): Promise<void> {
    console.log(obj);
  }
}

export { ChangeDeviceStatusService };
