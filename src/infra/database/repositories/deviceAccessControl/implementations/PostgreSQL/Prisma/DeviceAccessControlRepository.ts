import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceAccessControlRepository } from "../../../models/IDeviceAccessControlRepository";
import { verifyRole } from "../../../models/inputs/verifyRole";

class DeviceAccessControlRepository
  extends BaseRepository
  implements IDeviceAccessControlRepository
{
  public verifyRole = ({
    deviceId,
    userId,
    role,
  }: verifyRole): PrismaPromise<DeviceAccessControlModel | null> =>
    this.prisma.deviceAccessControl.findFirst({
      where: {
        userId,
        deviceId,
        AND: [(role ? { role } : undefined) as any],
      },
    });
}

export { DeviceAccessControlRepository };
