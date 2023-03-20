import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { CreateUserRequestModel } from "@http/dtos/user/CreateUserRequestModel";
import { CreateUserResponseModel } from "@http/dtos/user/CreateUserResponseModel";
import { IUserRepository } from "@infra/database/repositories/user";
import { transaction } from "@infra/database/transaction";
import { UserModel } from "@models/UserModel";
import { IAuthTokenPayload, IAuthTokenProvider } from "@providers/authToken";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class CreateUserService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("AuthTokenProvider")
    private authTokenProvider: IAuthTokenProvider,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider
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
      this.userRepository.hasEmail({ email }),
    ]);

    if (hasEmail)
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailAlreadyExists"));

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const [userCreated] = await transaction([
      this.userRepository.save({
        name,
        email,
        password: await this.hashProvider.hash(password, hashSalt),
        id: this.uniqueIdentifierProvider.generate(),
      } as UserModel),
    ]);

    const accessToken = this.authTokenProvider.generate({
      id: userCreated.id,
      name: userCreated.name,
      type: "accessToken",
    } as IAuthTokenPayload);

    const refreshToken = this.authTokenProvider.generate({
      id: userCreated.id,
      type: "refreshToken",
    } as IAuthTokenPayload);

    return {
      accessToken,
      refreshToken,
    };
  }
}

export { CreateUserService };
