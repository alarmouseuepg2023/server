import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { IDeviceRepository } from "../../../models/IDeviceRepository";
import { hasMacAddressInput } from "../../../models/input/hasMacAddressInput";

class DeviceRepository extends BaseRepository implements IDeviceRepository {
  public hasMacAddress = ({
    macAddress,
  }: hasMacAddressInput): PrismaPromise<DeviceModel | null> =>
    this.prisma.device.findFirst({
      where: { macAddress },
      select: {
        id: true,
        macAddress: true,
        ownerPassword: true,
        nickname: true,
        wifiSsid: true,
        wifiPassword: true,
        status: true,
      },
    });
}

export { DeviceRepository };
