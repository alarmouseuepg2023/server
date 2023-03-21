import { RoleModel } from "@models/RoleModel";
import { PrismaPromise } from "@prisma/client";

import { verifyRole } from "./inputs/verifyRole";

interface IRoleRepository {
  verify(_: verifyRole): PrismaPromise<RoleModel | null>;
}

export { IRoleRepository };
