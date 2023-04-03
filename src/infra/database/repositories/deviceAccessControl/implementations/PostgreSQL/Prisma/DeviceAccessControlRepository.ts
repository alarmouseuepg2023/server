import { injectable } from "inversify";

import { RolesKeys } from "@commons/RolesKey";
import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceAccessControlRepository } from "../../../models/IDeviceAccessControlRepository";
import { deleteInput } from "../../../models/inputs/deleteInput";
import { getByIdInput } from "../../../models/inputs/getByIdInput";
import { getGuestsInput } from "../../../models/inputs/getGuestsInput";
import { saveInput } from "../../../models/inputs/saveInput";
import { updateControlPropsInput } from "../../../models/inputs/updateControlPropsInput";
import { updatePasswordInput } from "../../../models/inputs/updatePasswordInput";
import { verifyRoleInput } from "../../../models/inputs/verifyRoleInput";

@injectable()
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

  public countGuests = ({ deviceId }: getGuestsInput): PrismaPromise<number> =>
    this.prisma.deviceAccessControl.count({
      where: { deviceId, role: RolesKeys.GUEST },
    });

  public getGuests = (
    { deviceId }: getGuestsInput,
    [take, skip]: [number, number]
  ): PrismaPromise<
    {
      user: { id: string; email: string; name: string } & {
        invitee: { answeredAt: Date | null; invitedAt: Date }[];
      };
    }[]
  > =>
    this.prisma.deviceAccessControl.findMany({
      where: { deviceId, role: RolesKeys.GUEST },
      orderBy: { user: { name: "asc" } },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            invitee: {
              take: 1,
              where: {
                deviceId,
                status: InviteStatusDomain.ACCEPTED,
              },
              select: {
                answeredAt: true,
                invitedAt: true,
              },
            },
          },
        },
      },
      skip,
      take,
    });

  public updateControlProps = ({
    unlockAttempts,
    lastFailedUnlock,
    deviceId,
    userId,
    blocked,
  }: updateControlPropsInput): PrismaPromise<DeviceAccessControlModel> =>
    this.prisma.deviceAccessControl.update({
      where: {
        userId_deviceId: { deviceId, userId },
      },
      data: {
        blocked,
        unlockAttempts,
        lastFailedUnlock,
      },
    });
}

export { DeviceAccessControlRepository };
