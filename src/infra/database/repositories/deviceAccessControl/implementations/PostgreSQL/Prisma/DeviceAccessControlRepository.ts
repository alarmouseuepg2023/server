import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceAccessControlRepository } from "../../../models/IDeviceAccessControlRepository";
import { saveInput } from "../../../models/inputs/saveInput";
import { verifyRoleInput } from "../../../models/inputs/verifyRoleInput";

class DeviceAccessControlRepository
  extends BaseRepository
  implements IDeviceAccessControlRepository
{
  public verifyRole = ({
    deviceId,
    userId,
    role,
  }: verifyRoleInput): PrismaPromise<DeviceAccessControlModel | null> =>
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
  }: saveInput): PrismaPromise<{ role: string }> =>
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
