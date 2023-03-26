import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { getByIdInput } from "./inputs/getByIdInput";
import { getIdByMacAddressInput } from "./inputs/getIdByMacAddressInput";
import { getInput } from "./inputs/getInput";
import { hasMacAddressInput } from "./inputs/hasMacAddressInput";
import { updateStatusInput } from "./inputs/updateStatusInput";

interface IDeviceRepository {
  hasMacAddress(_: hasMacAddressInput): PrismaPromise<DeviceModel | null>;

  save(_: DeviceModel & { userId: string }): PrismaPromise<DeviceModel>;

  getById(_: getByIdInput): PrismaPromise<Partial<DeviceModel> | null>;

  count(_: getInput): PrismaPromise<number>;

  get(
    _: getInput,
    __: [number, number]
  ): PrismaPromise<
    (Exclude<DeviceModel, "wifiPassword"> & {
      DeviceAccessControl: Exclude<DeviceAccessControlModel, "password">[];
    })[]
  >;

  updateStatus(_: updateStatusInput): PrismaPromise<DeviceModel>;

  getByMacAddress(_: getIdByMacAddressInput): PrismaPromise<{
    id: string;
    nickname: string;
    owner: { email: string };
  } | null>;
}

export { IDeviceRepository };
