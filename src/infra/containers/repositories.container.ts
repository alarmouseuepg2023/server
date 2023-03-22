import { container } from "tsyringe";

import {
  DeviceRepository,
  IDeviceRepository,
} from "@infra/database/repositories/device";
import {
  DeviceAccessControlRepository,
  IDeviceAccessControlRepository,
} from "@infra/database/repositories/deviceAccessControl";
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
