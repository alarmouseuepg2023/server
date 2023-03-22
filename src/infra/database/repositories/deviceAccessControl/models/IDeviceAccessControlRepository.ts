import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { saveInput } from "./inputs/saveInput";
import { verifyRoleInput } from "./inputs/verifyRoleInput";

interface IDeviceAccessControlRepository {
  verifyRole(
    _: verifyRoleInput
  ): PrismaPromise<DeviceAccessControlModel | null>;

  save(_: saveInput): PrismaPromise<{ role: string }>;
}

export { IDeviceAccessControlRepository };
