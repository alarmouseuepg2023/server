import { injectable } from "inversify";

import { DeviceWifiChangesHaveStartedRequestModel } from "@infra/dtos/device/DeviceWifiChangesHaveStartedRequestModel";

@injectable()
class NotifyAllDeviceWifiChangesHaveStartedService {
  public async execute(
    obj: DeviceWifiChangesHaveStartedRequestModel
  ): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { NotifyAllDeviceWifiChangesHaveStartedService };
