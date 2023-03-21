import { container } from "tsyringe";

import { IRoleRepository, RoleRepository } from "@repositories/role";
import { IUserRepository, UserRepository } from "@repositories/user";

container.registerSingleton<IUserRepository>("UserRepository", UserRepository);

container.registerSingleton<IRoleRepository>("RoleRepository", RoleRepository);
