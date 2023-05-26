import { injectable } from "inversify";

import { UserAuthenticationAtDeviceRequestModel } from "@infra/dtos/device/UserAuthenticationAtDeviceRequestModel";

@injectable()
class UserAuthenticationAtDeviceService {
  public async execute(
    obj: UserAuthenticationAtDeviceRequestModel
  ): Promise<void> {
    console.log(obj);
  }
}

export { UserAuthenticationAtDeviceService };
