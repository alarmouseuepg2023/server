import { container } from "tsyringe";

import {
  AlarmEventsRepository,
  IAlarmEventsRepository,
} from "@repositories/alarmEvents";
import { DeviceRepository, IDeviceRepository } from "@repositories/device";
import {
  DeviceAccessControlRepository,
  IDeviceAccessControlRepository,
} from "@repositories/deviceAccessControl";
import { IInviteRepository, InviteRepository } from "@repositories/invite";
import { IUserRepository, UserRepository } from "@repositories/user";
import {
  IWaitingEmailConfirmationRepository,
  WaitingEmailConfirmationRepository,
} from "@repositories/waitingEmailConfirmation";

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

container.registerSingleton<IWaitingEmailConfirmationRepository>(
  "WaitingEmailConfirmationRepository",
  WaitingEmailConfirmationRepository
);
