import { AlarmEvents, PrismaPromise } from "@prisma/client";

import { saveInput } from "./inputs/saveInput";

interface IAlarmEventsRepository {
  save(_: saveInput): PrismaPromise<AlarmEvents>;
}

export { IAlarmEventsRepository };
