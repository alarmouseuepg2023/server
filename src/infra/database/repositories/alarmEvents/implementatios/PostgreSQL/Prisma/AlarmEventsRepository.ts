import { BaseRepository } from "@infra/database/repositories/BaseRepository";

import { IAlarmEventsRepository } from "../../../models/IAlarmEventsRepository";

class AlarmEventsRepository
  extends BaseRepository
  implements IAlarmEventsRepository {}

export { AlarmEventsRepository };
