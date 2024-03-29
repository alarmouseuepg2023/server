import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { DeviceModel } from "@models/DeviceModel";
import { PrismaPromise } from "@prisma/client";

import { deleteByUserInput } from "./inputs/deleteByUserInput";
import { deleteInput } from "./inputs/deleteInput";
import { getByIdInput } from "./inputs/getByIdInput";
import { getIdByMacAddressInput } from "./inputs/getIdByMacAddressInput";
import { getInput } from "./inputs/getInput";
import { hasMacAddressInput } from "./inputs/hasMacAddressInput";
import { updateStatusInput } from "./inputs/updateStatusInput";

interface IDeviceRepository {
  hasMacAddress(_: hasMacAddressInput): PrismaPromise<DeviceModel | null>;

  save(_: DeviceModel & { userId: string }): PrismaPromise<DeviceModel>;

  getById(_: getByIdInput): PrismaPromise<DeviceModel | null>;

  count(_: getInput): PrismaPromise<number>;

  get(
    _: getInput,
    __: [number, number]
  ): PrismaPromise<
    (Exclude<DeviceModel, "wifiPassword"> & {
      owner: { name: string };
      DeviceAccessControl: Exclude<DeviceAccessControlModel, "password">[];
    })[]
  >;

  updateStatus(_: updateStatusInput): PrismaPromise<DeviceModel>;

  getByMacAddress(
    _: getIdByMacAddressInput
  ): PrismaPromise<
    (DeviceModel & { owner: { id: string; email: string } }) | null
  >;

  deleteByUser(_: deleteByUserInput): PrismaPromise<{ count: number }>;

  delete(_: deleteInput): PrismaPromise<DeviceModel>;
}

export { IDeviceRepository };
