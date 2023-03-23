import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";

import { answerInput } from "./inputs/answerInput";
import { getByIdAndUserInput } from "./inputs/getByIdAndUserInput";
import { getInput } from "./inputs/getInput";
import { saveInput } from "./inputs/saveInput";

interface IInviteRepository {
  save(_: saveInput): PrismaPromise<InviteModel>;

  getByIdAndUser(
    _: getByIdAndUserInput
  ): PrismaPromise<(InviteModel & { deviceId: string }) | null>;

  answer(_: answerInput): PrismaPromise<InviteModel>;

  count(_: getInput): PrismaPromise<number>;

  get(
    _: getInput,
    __: [number, number]
  ): PrismaPromise<
    {
      id: string;
      invitedAt: Date;
      device: { nickname: string };
      inviter: { name: string };
    }[]
  >;
}

export { IInviteRepository };
