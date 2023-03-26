import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { AlarmEventsModel } from "@models/AlarmEventsModel";
import { AlarmEvents, PrismaPromise } from "@prisma/client";

import { IAlarmEventsRepository } from "../../../models/IAlarmEventsRepository";
import { getInput } from "../../../models/inputs/getInput";
import { saveInput } from "../../../models/inputs/saveInput";

class AlarmEventsRepository
  extends BaseRepository
  implements IAlarmEventsRepository
{
  public save = ({
    id,
    createdAt,
    deviceId,
    message,
    userId,
  }: saveInput): PrismaPromise<AlarmEvents> =>
    this.prisma.alarmEvents.create({
      data: {
        id,
        createdAt,
        message,
        deviceId,
        userId,
      },
    });

  public count = ({ deviceId }: getInput): PrismaPromise<number> =>
    this.prisma.alarmEvents.count({
      where: { deviceId },
    });

  public get = (
    { deviceId }: getInput,
    [take, skip]: [number, number]
  ): PrismaPromise<
    (AlarmEventsModel & { user: { id: string; name: string } | null })[]
  > =>
    this.prisma.alarmEvents.findMany({
      where: { deviceId },
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
}

export { AlarmEventsRepository };
