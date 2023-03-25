import { RevokeGuestPermissionRequestModel } from "@http/dtos/guest/RevokeGuestPermissionRequestModel";

class RevokeGuestPermissionService {
  public async execute(
    obj: RevokeGuestPermissionRequestModel
  ): Promise<boolean> {
    console.log(obj);
    return true;
  }
}

export { RevokeGuestPermissionService };
