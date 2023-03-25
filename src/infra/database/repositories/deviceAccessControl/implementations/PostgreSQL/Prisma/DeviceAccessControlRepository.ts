import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceAccessControlRepository } from "../../../models/IDeviceAccessControlRepository";
import { deleteInput } from "../../../models/inputs/deleteInput";
import { getByIdInput } from "../../../models/inputs/getByIdInput";
import { saveInput } from "../../../models/inputs/saveInput";
import { updatePasswordInput } from "../../../models/inputs/updatePasswordInput";
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

  public updatePassword = ({
    deviceId,
    userId,
    password,
  }: updatePasswordInput): PrismaPromise<DeviceAccessControlModel> =>
    this.prisma.deviceAccessControl.update({
      where: {
        userId_deviceId: {
          deviceId,
          userId,
        },
      },
      data: { password },
    });

  public getById = ({
    deviceId,
    userId,
  }: getByIdInput): PrismaPromise<DeviceAccessControlModel | null> =>
    this.prisma.deviceAccessControl.findFirst({
      where: {
        deviceId,
        userId,
      },
    });

  public delete = ({
    deviceId,
    userId,
  }: deleteInput): PrismaPromise<DeviceAccessControlModel> =>
    this.prisma.deviceAccessControl.delete({
      where: {
        userId_deviceId: {
          deviceId,
          userId,
        },
      },
    });
}

export { DeviceAccessControlRepository };
