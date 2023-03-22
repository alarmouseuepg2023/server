import { UserModel } from "@models/UserModel";
import { PrismaPromise } from "@prisma/client";

import { getByIdInput } from "./inputs/getByIdInput";
import { hasEmailInput } from "./inputs/hasEmailInput";
import { updateLoginControlPropsInput } from "./inputs/updateLoginControlPropsInput";

interface IUserRepository {
  hasEmail(_: hasEmailInput): PrismaPromise<UserModel | null>;

  updateLoginControlProps(
    _: updateLoginControlPropsInput
  ): PrismaPromise<{ blocked: boolean; loginAttempts: number }>;

  save(_: UserModel): PrismaPromise<UserModel>;

  getById(_: getByIdInput): PrismaPromise<UserModel | null>;
}

export { IUserRepository };
