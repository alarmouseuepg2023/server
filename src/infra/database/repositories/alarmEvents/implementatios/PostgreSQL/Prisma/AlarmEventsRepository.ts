import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { AlarmEvents, PrismaPromise } from "@prisma/client";

import { IAlarmEventsRepository } from "../../../models/IAlarmEventsRepository";
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
}

export { AlarmEventsRepository };
