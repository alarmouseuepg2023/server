import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { WaitingEmailConfirmationModel } from "@models/WaitingEmailConfirmationModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "../../../models/inputs/deleteInput";
import { getByIdInput } from "../../../models/inputs/getByIdInput";
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

  public getById = ({
    operation,
    userId,
  }: getByIdInput): PrismaPromise<WaitingEmailConfirmationModel | null> =>
    this.prisma.waitingEmailConfirmations.findFirst({
      where: {
        userId,
        operation,
      },
    });

  public delete = ({
    operation,
    userId,
  }: deleteInput): PrismaPromise<WaitingEmailConfirmationModel> =>
    this.prisma.waitingEmailConfirmations.delete({
      where: {
        userId_operation: {
          operation,
          userId,
        },
      },
    });
}

export { WaitingEmailConfirmationRepository };
