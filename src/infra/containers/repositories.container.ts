import { container } from "tsyringe";

import { IUserRepository, UserRepository } from "@repositories/user";

container.registerSingleton<IUserRepository>("UserRepository", UserRepository);
