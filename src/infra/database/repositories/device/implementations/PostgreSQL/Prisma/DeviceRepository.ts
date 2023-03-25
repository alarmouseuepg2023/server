import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceRepository } from "../../../models/IDeviceRepository";
import { getByIdInput } from "../../../models/inputs/getByIdInput";
import { getInput } from "../../../models/inputs/getInput";
import { hasMacAddressInput } from "../../../models/inputs/hasMacAddressInput";
import { updateStatusInput } from "../../../models/inputs/updateStatusInput";

class DeviceRepository extends BaseRepository implements IDeviceRepository {
  public hasMacAddress = ({
    macAddress,
  }: hasMacAddressInput): PrismaPromise<DeviceModel | null> =>
    this.prisma.device.findFirst({
      where: { macAddress },
      select: {
        id: true,
        macAddress: true,
        nickname: true,
        wifiSsid: true,
        wifiPassword: true,
        status: true,
      },
    });

  public save = ({
    id,
    macAddress,
    nickname,
    status,
    wifiPassword,
    wifiSsid,
    userId,
  }: DeviceModel & { userId: string }): PrismaPromise<DeviceModel> =>
    this.prisma.device.upsert({
      where: { id },
      create: {
        id,
        macAddress,
        nickname,
        status,
        wifiPassword,
        wifiSsid,
        ownerId: userId,
      },
      update: {
        nickname,
        wifiPassword,
        wifiSsid,
        status,
      },
    });

  public count = ({ userId }: getInput): PrismaPromise<number> =>
    this.prisma.device.count({
      where: {
        DeviceAccessControl: {
          some: {
            userId,
          },
        },
      },
    });

  public get = (
    { userId }: getInput,
    [take, skip]: [number, number]
  ): PrismaPromise<
    (Exclude<DeviceModel, "wifiPassword"> & {
      DeviceAccessControl: Exclude<DeviceAccessControlModel, "password">[];
    })[]
  > =>
    this.prisma.device.findMany({
      where: {
        DeviceAccessControl: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        macAddress: true,
        nickname: true,
        wifiSsid: true,
        status: true,
        DeviceAccessControl: {
          where: { userId },
          take: 1,
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        nickname: "asc",
      },
      take,
      skip,
    }) as PrismaPromise<
      (Exclude<DeviceModel, "wifiPassword"> & {
        DeviceAccessControl: Exclude<DeviceAccessControlModel, "password">[];
      })[]
    >;

  public getById = ({
    deviceId,
  }: getByIdInput): PrismaPromise<Partial<DeviceModel> | null> =>
    this.prisma.device.findFirst({
      where: { id: deviceId },
      select: {
        id: true,
        nickname: true,
        status: true,
        macAddress: true,
      },
    });

  public updateStatus = ({
    deviceId,
    status,
  }: updateStatusInput): PrismaPromise<DeviceModel> =>
    this.prisma.device.update({
      where: { id: deviceId },
      data: { status },
    });
}

export { DeviceRepository };
