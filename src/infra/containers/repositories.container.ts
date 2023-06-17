import {
  IPushNotificationsRepository,
  PushNotificationRepository,
} from "@infra/database/repositories/pushNotification";
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

import { container } from "./container";

container.bind<IUserRepository>("UserRepository").to(UserRepository);

container
  .bind<IDeviceAccessControlRepository>("DeviceAccessControlRepository")
  .to(DeviceAccessControlRepository);

container.bind<IDeviceRepository>("DeviceRepository").to(DeviceRepository);

container.bind<IInviteRepository>("InviteRepository").to(InviteRepository);

container
  .bind<IAlarmEventsRepository>("AlarmEventsRepository")
  .to(AlarmEventsRepository);

container
  .bind<IWaitingEmailConfirmationRepository>(
    "WaitingEmailConfirmationRepository"
  )
  .to(WaitingEmailConfirmationRepository);

container
  .bind<IPushNotificationsRepository>("PushNotificationRepository")
  .to(PushNotificationRepository);
