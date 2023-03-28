import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { ResetPasswordRequestModel } from "@http/dtos/auth/ResetPasswordRequestModel";
import { IPasswordProvider } from "@providers/password";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ResetPasswordService {
  constructor(
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider
  ) {}

  public async execute({
    confirmPassword,
    password,
    pin,
    email,
  }: ResetPasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(pin))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPinRequired"));

    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailInvalid"));

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(confirmPassword))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorConfirmPasswordRequired")
      );

    if (password !== confirmPassword)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorPasswordAndConfirmAreNotEqual")
      );

    if (this.passwordProvider.outOfBounds(password))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorPasswordOutOfBounds", [
          this.passwordProvider.MIN_LENGTH,
          this.passwordProvider.MAX_LENGTH,
        ])
      );

    if (!this.passwordProvider.hasStrength(password))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPasswordToWeak"));

    return true;
  }
}

export { ResetPasswordService };
