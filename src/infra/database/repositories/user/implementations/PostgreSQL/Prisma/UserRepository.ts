import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { UserModel } from "@models/UserModel";
import { PrismaPromise } from "@prisma/client";
import { IUserRepository } from "@repositories/user/models/IUserRepository";

import { hasActivatedUserInput } from "../../../models/inputs/hasActivatedUserInput";
import { updateLoginControlPropsInput } from "../../../models/inputs/updateLoginControlPropsInput";

class UserRepository extends BaseRepository implements IUserRepository {
  public hasActivatedUser = ({
    email,
    blocked,
  }: hasActivatedUserInput): PrismaPromise<UserModel | null> =>
    this.prisma.user.findFirst({
      where: {
        email,
        AND: [blocked === undefined ? undefined : { blocked }] as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        loginAttempts: true,
        lastFailedLoginDate: true,
        blocked: true,
        password: true,
      },
    }) as PrismaPromise<UserModel | null>;

  public updateLoginControlProps = ({
    attempts,
    blocked,
    loginFailedDate,
    userId,
  }: updateLoginControlPropsInput): PrismaPromise<{
    blocked: boolean;
    loginAttempts: number;
  }> =>
    this.prisma.user.update({
      where: { id: userId },
      data: {
        blocked,
        loginAttempts: attempts,
        lastFailedLoginDate: loginFailedDate,
      },
      select: {
        blocked: true,
        loginAttempts: true,
      },
    });

  public save = ({
    id,
    name,
    email,
    password,
  }: UserModel): PrismaPromise<UserModel> =>
    this.prisma.user.upsert({
      where: { id },
      create: {
        id,
        name,
        email,
        password,
      },
      update: {
        name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        loginAttempts: true,
        lastFailedLoginDate: true,
        blocked: true,
        password: true,
      },
    }) as PrismaPromise<UserModel>;
}

export { UserRepository };
