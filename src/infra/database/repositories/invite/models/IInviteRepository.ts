import { InviteModel } from "@models/InviteModel";
import { PrismaPromise } from "@prisma/client";

import { saveInput } from "./inputs/saveInput";

interface IInviteRepository {
  save(_: saveInput): PrismaPromise<InviteModel>;
}

export { IInviteRepository };
