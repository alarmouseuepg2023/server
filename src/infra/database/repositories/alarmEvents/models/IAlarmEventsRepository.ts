import { AlarmEventsModel } from "@models/AlarmEventsModel";
import { AlarmEvents, PrismaPromise } from "@prisma/client";

import { getInput } from "./inputs/getInput";
import { saveInput } from "./inputs/saveInput";

interface IAlarmEventsRepository {
  save(_: saveInput): PrismaPromise<AlarmEvents>;

  get(
    _: getInput,
    __: [number, number]
  ): PrismaPromise<
    (AlarmEventsModel & { user: { id: string; name: string } })[]
  >;

  count(_: getInput): PrismaPromise<number>;
}

export { IAlarmEventsRepository };
