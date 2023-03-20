import { container } from "tsyringe";

import { AuthTokenProvider, IAuthTokenProvider } from "@providers/authToken";
import { DateProvider, IDateProvider } from "@providers/date";
import { HashProvider, IHashProvider } from "@providers/hash";
import { IValidatorsProvider, ValidatorsProvider } from "@providers/validators";

container.registerSingleton<IHashProvider>("HashProvider", HashProvider);

container.registerSingleton<IAuthTokenProvider>(
  "AuthTokenProvider",
  AuthTokenProvider
);

container.registerSingleton<IDateProvider>("DateProvider", DateProvider);

container.registerSingleton<IValidatorsProvider>(
  "ValidatorsProvider",
  ValidatorsProvider
);
