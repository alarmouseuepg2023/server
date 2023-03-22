import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { save } from "./inputs/save";
import { verifyRole } from "./inputs/verifyRole";

interface IDeviceAccessControlRepository {
  verifyRole(_: verifyRole): PrismaPromise<DeviceAccessControlModel | null>;

  save(_: save): PrismaPromise<{ role: string }>;
}

export { IDeviceAccessControlRepository };
