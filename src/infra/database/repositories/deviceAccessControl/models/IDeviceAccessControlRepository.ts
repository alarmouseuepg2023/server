import { DeviceAccessControlModel } from "@models/DeviceAccessControlModel";
import { PrismaPromise } from "@prisma/client";

import { verifyRole } from "./inputs/verifyRole";

interface IDeviceAccessControlRepository {
  verifyRole(_: verifyRole): PrismaPromise<DeviceAccessControlModel | null>;
}

export { IDeviceAccessControlRepository };
