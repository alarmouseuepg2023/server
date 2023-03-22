import { container } from "tsyringe";

import {
  DeviceRepository,
  IDeviceRepository,
} from "@infra/database/repositories/device";
import { IRoleRepository, RoleRepository } from "@repositories/role";
import { IUserRepository, UserRepository } from "@repositories/user";

container.registerSingleton<IUserRepository>("UserRepository", UserRepository);

container.registerSingleton<IRoleRepository>("RoleRepository", RoleRepository);

container.registerSingleton<IDeviceRepository>(
  "DeviceRepository",
  DeviceRepository
);
