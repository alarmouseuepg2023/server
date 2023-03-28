import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { WaitingEmailConfirmationModel } from "@models/WaitingEmailConfirmationModel";
import { PrismaPromise } from "@prisma/client";

import { saveInput } from "../../../models/inputs/saveInput";
import { IWaitingEmailConfirmationRepository } from "../../../models/IWaitingEmailConfirmationRepository";

class WaitingEmailConfirmationRepository
  extends BaseRepository
  implements IWaitingEmailConfirmationRepository
{
  public save = ({
    expiresIn,
    operation,
    pin,
    userId,
  }: saveInput): PrismaPromise<WaitingEmailConfirmationModel> =>
    this.prisma.waitingEmailConfirmations.upsert({
      where: {
        userId_operation: {
          operation,
          userId,
        },
      },
      create: {
        expiresIn,
        operation,
        pin,
        userId,
      },
      update: {
        expiresIn,
        pin,
      },
    });
}

export { WaitingEmailConfirmationRepository };
