import { container } from "tsyringe";

import {
  AlarmEventsRepository,
  IAlarmEventsRepository,
} from "@infra/database/repositories/alarmEvents";
import {
  DeviceRepository,
  IDeviceRepository,
} from "@infra/database/repositories/device";
import {
  DeviceAccessControlRepository,
  IDeviceAccessControlRepository,
} from "@infra/database/repositories/deviceAccessControl";
import {
  GuestRepository,
  IGuestRepository,
} from "@infra/database/repositories/guest";
import {
  IInviteRepository,
  InviteRepository,
} from "@infra/database/repositories/invite";
import { IUserRepository, UserRepository } from "@repositories/user";

container.registerSingleton<IUserRepository>("UserRepository", UserRepository);

container.registerSingleton<IDeviceAccessControlRepository>(
  "DeviceAccessControlRepository",
  DeviceAccessControlRepository
);

container.registerSingleton<IDeviceRepository>(
  "DeviceRepository",
  DeviceRepository
);

container.registerSingleton<IInviteRepository>(
  "InviteRepository",
  InviteRepository
);

container.registerSingleton<IAlarmEventsRepository>(
  "AlarmEventsRepository",
  AlarmEventsRepository
);

container.registerSingleton<IGuestRepository>(
  "GuestRepository",
  GuestRepository
);
