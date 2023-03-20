import { UserModel } from "@models/UserModel";
import { PrismaPromise } from "@prisma/client";

import { getById } from "./inputs/getById";
import { hasEmailInput } from "./inputs/hasEmailInput";
import { updateLoginControlPropsInput } from "./inputs/updateLoginControlPropsInput";

interface IUserRepository {
  hasEmail(_: hasEmailInput): PrismaPromise<UserModel | null>;

  updateLoginControlProps(
    _: updateLoginControlPropsInput
  ): PrismaPromise<{ blocked: boolean; loginAttempts: number }>;

  save(_: UserModel): PrismaPromise<UserModel>;

  getById(_: getById): PrismaPromise<UserModel | null>;
}

export { IUserRepository };
