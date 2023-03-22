import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";

import { IInviteRepository } from "../../../models/IInviteRepository";
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
}

export { InviteRepository };
