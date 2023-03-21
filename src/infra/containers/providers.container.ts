import { container } from "tsyringe";

import { AuthTokenProvider, IAuthTokenProvider } from "@providers/authToken";
import { DateProvider, IDateProvider } from "@providers/date";
import { HashProvider, IHashProvider } from "@providers/hash";
import { IPasswordProvider, PasswordProvider } from "@providers/password";
import {
  IUniqueIdentifierProvider,
  UniqueIdentifierProvider,
} from "@providers/uniqueIdentifier";
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

container.registerSingleton<IUniqueIdentifierProvider>(
  "UniqueIdentifierProvider",
  UniqueIdentifierProvider
);

container.registerSingleton<IPasswordProvider>(
  "PasswordProvider",
  PasswordProvider
);
