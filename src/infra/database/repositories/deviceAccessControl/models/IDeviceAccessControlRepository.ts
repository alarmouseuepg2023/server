import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "./inputs/deleteInput";
import { getByIdInput } from "./inputs/getByIdInput";
import { saveInput } from "./inputs/saveInput";
import { updatePasswordInput } from "./inputs/updatePasswordInput";
import { verifyRoleInput } from "./inputs/verifyRoleInput";

interface IDeviceAccessControlRepository {
  verifyRole(
    _: verifyRoleInput
  ): PrismaPromise<DeviceAccessControlModel | null>;

  save(_: saveInput): PrismaPromise<{ role: string }>;

  updatePassword(
    _: updatePasswordInput
  ): PrismaPromise<DeviceAccessControlModel>;

  getById(_: getByIdInput): PrismaPromise<DeviceAccessControlModel | null>;

  delete(_: deleteInput): PrismaPromise<DeviceAccessControlModel>;
}

export { IDeviceAccessControlRepository };
