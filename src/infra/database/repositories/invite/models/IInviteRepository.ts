import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";

import { answerInput } from "./inputs/answerInput";
import { getByIdAndUserInput } from "./inputs/getByIdAndUserInput";
import { saveInput } from "./inputs/saveInput";

interface IInviteRepository {
  save(_: saveInput): PrismaPromise<InviteModel>;

  getByIdAndUser(
    _: getByIdAndUserInput
  ): PrismaPromise<(InviteModel & { deviceId: string }) | null>;

  answer(_: answerInput): PrismaPromise<InviteModel>;
}

export { IInviteRepository };
