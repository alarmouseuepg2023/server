import { injectable } from "inversify";

import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceRepository } from "../../../models/IDeviceRepository";
import { deleteByUserInput } from "../../../models/inputs/deleteByUserInput";
import { deleteInput } from "../../../models/inputs/deleteInput";
import { getByIdInput } from "../../../models/inputs/getByIdInput";
import { getIdByMacAddressInput } from "../../../models/inputs/getIdByMacAddressInput";
import { getInput } from "../../../models/inputs/getInput";
import { hasMacAddressInput } from "../../../models/inputs/hasMacAddressInput";
import { updateStatusInput } from "../../../models/inputs/updateStatusInput";

@injectable()
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
        status: true,
      },
    });

  public save = ({
    id,
    macAddress,
    nickname,
    status,
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
        wifiSsid,
        ownerId: userId,
      },
      update: {
        nickname,
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
      owner: { name: string };
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
        owner: {
          select: {
            name: true,
          },
        },
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
        owner: { name: string };
        DeviceAccessControl: Exclude<DeviceAccessControlModel, "password">[];
      })[]
    >;

  public getById = ({
    deviceId,
  }: getByIdInput): PrismaPromise<DeviceModel | null> =>
    this.prisma.device.findFirst({
      where: { id: deviceId },
    });

  public updateStatus = ({
    deviceId,
    status,
  }: updateStatusInput): PrismaPromise<DeviceModel> =>
    this.prisma.device.update({
      where: { id: deviceId },
      data: { status },
    });

  public getByMacAddress = ({
    macAddress,
  }: getIdByMacAddressInput): PrismaPromise<
    (DeviceModel & { owner: { id: string; email: string } }) | null
  > =>
    this.prisma.device.findFirst({
      where: { macAddress },
      select: {
        id: true,
        nickname: true,
        status: true,
        wifiSsid: true,
        macAddress: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

  public deleteByUser = ({
    userId,
  }: deleteByUserInput): PrismaPromise<{ count: number }> =>
    this.prisma.device.deleteMany({
      where: {
        ownerId: userId,
      },
    });

  public delete = ({ id }: deleteInput): PrismaPromise<DeviceModel> =>
    this.prisma.device.delete({
      where: {
        id,
      },
    });
}

export { DeviceRepository };
