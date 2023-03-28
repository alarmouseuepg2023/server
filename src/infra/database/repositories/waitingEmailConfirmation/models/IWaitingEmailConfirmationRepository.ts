import { WaitingEmailConfirmationModel } from "@models/WaitingEmailConfirmationModel";
import { PrismaPromise } from "@prisma/client";

import { saveInput } from "./inputs/saveInput";

interface IWaitingEmailConfirmationRepository {
  save(_: saveInput): PrismaPromise<WaitingEmailConfirmationModel>;
}

export { IWaitingEmailConfirmationRepository };
