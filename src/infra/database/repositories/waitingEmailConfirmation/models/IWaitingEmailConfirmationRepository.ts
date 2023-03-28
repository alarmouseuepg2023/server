import { WaitingEmailConfirmationModel } from "@models/WaitingEmailConfirmationModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "./inputs/deleteInput";
import { getByIdInput } from "./inputs/getByIdInput";
import { saveInput } from "./inputs/saveInput";

interface IWaitingEmailConfirmationRepository {
  save(_: saveInput): PrismaPromise<WaitingEmailConfirmationModel>;

  getById(_: getByIdInput): PrismaPromise<WaitingEmailConfirmationModel | null>;

  delete(_: deleteInput): PrismaPromise<WaitingEmailConfirmationModel>;
}

export { IWaitingEmailConfirmationRepository };
