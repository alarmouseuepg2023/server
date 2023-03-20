import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { CreateUserRequestModel } from "@http/dtos/user/CreateUserRequestModel";
import { CreateUserResponseModel } from "@http/dtos/user/CreateUserResponseModel";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class CreateUserService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository
  ) {}

  public async execute({
    confirmPassword,
    email,
    name,
    password,
  }: CreateUserRequestModel): Promise<CreateUserResponseModel> {
    if (stringIsNullOrEmpty(name))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorNameRequired"));

    if (!this.validatorsProvider.length(name, VarcharMaxLength.USER_NAME))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorVarCharMaxLengthExceeded", [
          i18n.__("RandomWord_Name"),
          VarcharMaxLength.USER_NAME,
        ])
      );

    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailInvalid"));

    if (!this.validatorsProvider.length(email, VarcharMaxLength.USER_EMAIL))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorVarCharMaxLengthExceeded", [
          i18n.__("RandomWord_Email"),
          VarcharMaxLength.USER_EMAIL,
        ])
      );

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

    const [hasEmail] = await transaction([
      this.userRepository.hasActivatedUser({ email, blocked: undefined }),
    ]);

    if (hasEmail)
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailAlreadyExists"));

    return {
      accessToken: "",
      refreshToken: "",
    };
  }
}

export { CreateUserService };
