import { AuthTokenProvider, IAuthTokenProvider } from "@providers/authToken";
import { DateProvider, IDateProvider } from "@providers/date";
import { HashProvider, IHashProvider } from "@providers/hash";
import { IMaskProvider, MaskProvider } from "@providers/mask";
import { IPasswordProvider, PasswordProvider } from "@providers/password";
import { IQRCodeProvider, QRCodeProvider } from "@providers/qrcode";
import {
  IUniqueIdentifierProvider,
  UniqueIdentifierProvider,
} from "@providers/uniqueIdentifier";
import { IValidatorsProvider, ValidatorsProvider } from "@providers/validators";

import { container } from "./container";

container.bind<IHashProvider>("HashProvider").to(HashProvider);

container.bind<IAuthTokenProvider>("AuthTokenProvider").to(AuthTokenProvider);

container.bind<IDateProvider>("DateProvider").to(DateProvider);

container
  .bind<IValidatorsProvider>("ValidatorsProvider")
  .to(ValidatorsProvider);

container
  .bind<IUniqueIdentifierProvider>("UniqueIdentifierProvider")
  .to(UniqueIdentifierProvider);

container.bind<IPasswordProvider>("PasswordProvider").to(PasswordProvider);

container.bind<IQRCodeProvider>("QRCodeProvider").to(QRCodeProvider);

container.bind<IMaskProvider>("MaskProvider").to(MaskProvider);
