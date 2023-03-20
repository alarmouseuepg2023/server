import { RoleModel } from "@models/RoleModel";
import { UserModel } from "@models/UserModel";
import { PrismaPromise } from "@prisma/client";

import { getById } from "./inputs/getById";
import { hasEmailInput } from "./inputs/hasEmailInput";
import { updateLoginControlPropsInput } from "./inputs/updateLoginControlPropsInput";
import { verifyRole } from "./inputs/verifyRole";

interface IUserRepository {
  hasEmail(_: hasEmailInput): PrismaPromise<UserModel | null>;

  updateLoginControlProps(
    _: updateLoginControlPropsInput
  ): PrismaPromise<{ blocked: boolean; loginAttempts: number }>;

  save(_: UserModel): PrismaPromise<UserModel>;

  getById(_: getById): PrismaPromise<UserModel | null>;

  verifyRole(_: verifyRole): PrismaPromise<RoleModel | null>;
}

export { IUserRepository };
