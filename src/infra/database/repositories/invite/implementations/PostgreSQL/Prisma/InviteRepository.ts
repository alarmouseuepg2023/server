import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";

import { IInviteRepository } from "../../../models/IInviteRepository";
import { getByIdAndUserInput } from "../../../models/inputs/getByIdAndUserInput";
import { saveInput } from "../../../models/inputs/saveInput";

class InviteRepository extends BaseRepository implements IInviteRepository {
  public save = ({
    deviceId,
    invitedAt,
    id,
    inviteeId,
    inviterId,
    token,
    status,
  }: saveInput): PrismaPromise<InviteModel> =>
    this.prisma.invite.upsert({
      where: {
        inviteeId_inviterId_deviceId: {
          inviteeId,
          inviterId,
          deviceId,
        },
      },
      create: {
        id,
        token,
        inviteeId,
        inviterId,
        invitedAt,
        status,
        deviceId,
      },
      update: {
        status,
        token,
        invitedAt,
        answeredAt: null,
      },
    });

  public getByIdAndUser = ({
    id,
    userId,
  }: getByIdAndUserInput): PrismaPromise<InviteModel | null> =>
    this.prisma.invite.findFirst({
      where: {
        id,
        inviteeId: userId,
      },
    });
}

export { InviteRepository };
