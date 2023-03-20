import { container } from "tsyringe";

import { HashProvider, IHashProvider } from "@providers/hash";

container.registerSingleton<IHashProvider>("HashProvider", HashProvider);
