import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { getInput } from "./inputs/getInput";
import { hasMacAddressInput } from "./inputs/hasMacAddressInput";

interface IDeviceRepository {
  hasMacAddress(_: hasMacAddressInput): PrismaPromise<DeviceModel | null>;

  save(_: DeviceModel & { userId: string }): PrismaPromise<DeviceModel>;

  count(_: getInput): PrismaPromise<number>;

  get(
    _: getInput,
    __: [number, number]
  ): PrismaPromise<
    (Exclude<DeviceModel, "wifiPassword"> & {
      DeviceAccessControl: Exclude<DeviceAccessControlModel, "password">[];
    })[]
  >;
}

export { IDeviceRepository };
