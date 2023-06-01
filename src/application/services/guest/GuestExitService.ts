import { inject, injectable } from "inversify";

import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { RevokeGuestPermissionRequestModel } from "@infra/dtos/guest/RevokeGuestPermissionRequestModel";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

import { RevokeGuestPermissionService } from "./RevokeGuestPermissionService";

@injectable()
class GuestExitService extends RevokeGuestPermissionService {
  constructor(
    @inject("DeviceAccessControlRepository")
    deviceAccessControlRepository: IDeviceAccessControlRepository,
    @inject("UniqueIdentifierProvider")
    uniqueIdentifierProvider: IUniqueIdentifierProvider
  ) {
    super(uniqueIdentifierProvider, deviceAccessControlRepository);
  }

  public async execute({
    deviceId,
    guestId,
  }: RevokeGuestPermissionRequestModel): Promise<boolean> {
    const result = await super.execute({
      deviceId,
      guestId,
    });

    return result;
  }
}

export { GuestExitService };
