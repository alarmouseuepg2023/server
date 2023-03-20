import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { RoleModel } from "@models/RoleModel";
import { UserModel } from "@models/UserModel";
import { PrismaPromise } from "@prisma/client";
import { IUserRepository } from "@repositories/user/models/IUserRepository";

import { getById } from "../../../models/inputs/getById";
import { hasEmailInput } from "../../../models/inputs/hasEmailInput";
import { updateLoginControlPropsInput } from "../../../models/inputs/updateLoginControlPropsInput";
import { verifyRole } from "../../../models/inputs/verifyRole";

class UserRepository extends BaseRepository implements IUserRepository {
  public hasEmail = ({
    email,
  }: hasEmailInput): PrismaPromise<UserModel | null> =>
    this.prisma.user.findFirst({
      where: { email },
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

  public getById = ({ id }: getById): PrismaPromise<UserModel | null> =>
    this.prisma.user.findFirst({
      where: { id },
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

  public verifyRole = ({
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

export { UserRepository };
