import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceRepository } from "../../../models/IDeviceRepository";
import { hasMacAddressInput } from "../../../models/inputs/hasMacAddressInput";

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
}

export { DeviceRepository };
