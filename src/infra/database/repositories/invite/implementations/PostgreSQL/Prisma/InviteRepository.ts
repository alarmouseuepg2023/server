import { InviteStatusDomain } from "@domains/InviteStatusDomain";
import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";

import { IInviteRepository } from "../../../models/IInviteRepository";
import { answerInput } from "../../../models/inputs/answerInput";
import { getByIdAndUserInput } from "../../../models/inputs/getByIdAndUserInput";
import { getInput } from "../../../models/inputs/getInput";
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
  }: getByIdAndUserInput): PrismaPromise<
    (InviteModel & { deviceId: string }) | null
  > =>
    this.prisma.invite.findFirst({
      where: {
        id,
        inviteeId: userId,
      },
    });

  public answer = ({
    answeredAt,
    id,
    status,
  }: answerInput): PrismaPromise<InviteModel> =>
    this.prisma.invite.update({
      where: { id },
      data: {
        status,
        answeredAt,
      },
    });

  public count = ({ userId }: getInput): PrismaPromise<number> =>
    this.prisma.invite.count({
      where: {
        inviteeId: userId,
        status: {
          in: [InviteStatusDomain.CREATED, InviteStatusDomain.SENT],
        },
      },
    });

  public get = (
    { userId }: getInput,
    [take, skip]: [number, number]
  ): PrismaPromise<
    {
      id: string;
      invitedAt: Date;
      device: { nickname: string };
      inviter: { name: string };
    }[]
  > =>
    this.prisma.invite.findMany({
      where: {
        inviteeId: userId,
        status: {
          in: [InviteStatusDomain.CREATED, InviteStatusDomain.SENT],
        },
      },
      select: {
        id: true,
        invitedAt: true,
        device: {
          select: {
            nickname: true,
          },
        },
        inviter: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
      take,
      skip,
    });
}

export { InviteRepository };
