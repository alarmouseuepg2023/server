import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { hasMacAddressInput } from "./input/hasMacAddressInput";

interface IDeviceRepository {
  hasMacAddress(_: hasMacAddressInput): PrismaPromise<DeviceModel | null>;

  save(_: DeviceModel & { userId: string }): PrismaPromise<DeviceModel>;
}

export { IDeviceRepository };
