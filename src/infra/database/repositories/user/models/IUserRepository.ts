import { UserModel } from "@models/UserModel";
import { PrismaPromise } from "@prisma/client";

import { hasActivatedUserInput } from "./inputs/hasActivatedUserInput";
import { updateLoginControlPropsInput } from "./inputs/updateLoginControlPropsInput";

interface IUserRepository {
  hasActivatedUser(_: hasActivatedUserInput): PrismaPromise<UserModel | null>;

  updateLoginControlProps(
    _: updateLoginControlPropsInput
  ): PrismaPromise<{ blocked: boolean; loginAttempts: number }>;
}

export { IUserRepository };
