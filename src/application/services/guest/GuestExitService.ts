import { injectable } from "inversify";

import { GuestExitRequestModel } from "@infra/dtos/guest/GuestExitRequestModel";

@injectable()
class GuestExitService {
  public async execute(obj: GuestExitRequestModel): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { GuestExitService };
