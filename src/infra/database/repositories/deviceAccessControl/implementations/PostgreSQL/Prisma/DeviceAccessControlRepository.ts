import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceAccessControlRepository } from "../../../models/IDeviceAccessControlRepository";
import { save } from "../../../models/inputs/save";
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

  public save = ({
    deviceId,
    password,
    role,
    userId,
  }: save): PrismaPromise<{ role: string }> =>
    this.prisma.deviceAccessControl.create({
      data: {
        role,
        password,
        deviceId,
        userId,
      },
      select: {
        role: true,
      },
    });
}

export { DeviceAccessControlRepository };
