import { container } from "tsyringe";

import { AuthTokenProvider, IAuthTokenProvider } from "@providers/authToken";
import { HashProvider, IHashProvider } from "@providers/hash";

container.registerSingleton<IHashProvider>("HashProvider", HashProvider);

container.registerSingleton<IAuthTokenProvider>(
  "AuthTokenProvider",
  AuthTokenProvider
);
