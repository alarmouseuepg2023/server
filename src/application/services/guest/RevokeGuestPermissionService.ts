import { inject, injectable } from "inversify";

import { RolesKeys } from "@commons/RolesKey";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { getMessage } from "@helpers/translatedMessagesControl";
import { IDeviceAccessControlRepository } from "@infra/database/repositories/deviceAccessControl";
import { transaction } from "@infra/database/transaction";
import { RevokeGuestPermissionRequestModel } from "@infra/dtos/guest/RevokeGuestPermissionRequestModel";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class RevokeGuestPermissionService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceAccessControlRepository")
    private deviceAccessControlRepository: IDeviceAccessControlRepository
  ) {}

  public async execute({
    deviceId,
    guestId,
  }: RevokeGuestPermissionRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceIdRequired"));

    if (stringIsNullOrEmpty(guestId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorGuestIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(deviceId) ||
      !this.uniqueIdentifierProvider.isValid(guestId)
    )
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    const [hasPermission] = await transaction([
      this.deviceAccessControlRepository.verifyRole({
        deviceId,
        userId: guestId,
        role: RolesKeys.GUEST,
      }),
    ]);

    if (!hasPermission)
      throw new AppError("NOT_FOUND", getMessage("ErrorGuestNotFound"));

    const [deleted] = await transaction([
      this.deviceAccessControlRepository.delete({
        deviceId,
        userId: guestId,
      }),
    ]);

    return !!deleted;
  }
}

export { RevokeGuestPermissionService };
