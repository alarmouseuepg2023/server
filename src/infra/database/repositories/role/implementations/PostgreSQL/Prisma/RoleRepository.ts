import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { RoleModel } from "@models/RoleModel";
import { PrismaPromise } from "@prisma/client";

import { verifyRole } from "../../../models/inputs/verifyRole";
import { IRoleRepository } from "../../../models/IRoleRepository";

class RoleRepository extends BaseRepository implements IRoleRepository {
  public verify = ({
    deviceId,
    userId,
    role,
  }: verifyRole): PrismaPromise<RoleModel | null> =>
    this.prisma.role.findFirst({
      where: {
        userId,
        deviceId,
        AND: [(role ? { name: role } : undefined) as any],
      },
    });
}

export { RoleRepository };
