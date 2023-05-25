import { injectable } from "inversify";

import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { AlarmEventsModel } from "@models/AlarmEventsModel";
import { AlarmEvents, PrismaPromise } from "@prisma/client";

import { IAlarmEventsRepository } from "../../../models/IAlarmEventsRepository";
import { getInput } from "../../../models/inputs/getInput";
import { saveInput } from "../../../models/inputs/saveInput";
import { clause2searchAlarmEventsWithFilters } from "./clause2searchAlarmEventsWithFilters";

@injectable()
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
    currentStatus,
  }: saveInput): PrismaPromise<AlarmEvents> =>
    this.prisma.alarmEvents.create({
      data: {
        id,
        createdAt,
        message,
        deviceId,
        userId,
        currentStatus,
      },
    });

  public count = ({ deviceId, filters }: getInput): PrismaPromise<number> =>
    this.prisma.alarmEvents.count({
      where: {
        deviceId,
        AND: clause2searchAlarmEventsWithFilters(filters),
      },
    });

  public get = (
    { deviceId, filters }: getInput,
    [take, skip]: [number, number]
  ): PrismaPromise<
    (AlarmEventsModel & { user: { id: string; name: string } | null })[]
  > =>
    this.prisma.alarmEvents.findMany({
      where: {
        deviceId,
        AND: clause2searchAlarmEventsWithFilters(filters),
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
        currentStatus: true,
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
