import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { transaction } from "@infra/database/transaction";
import { ChangePasswordRequestModel } from "@infra/dtos/user/ChangePasswordRequestModel";
import { IHashProvider } from "@providers/hash";
import { IPasswordProvider } from "@providers/password";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IUserRepository } from "@repositories/user";

@injectable()
class ChangePasswordService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider
  ) {}

  public async execute({
    confirmPassword,
    password,
    oldPassword,
    userId,
  }: ChangePasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(oldPassword))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorResetPasswdOldPasswordRequired")
      );

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPasswordRequired"));

    if (stringIsNullOrEmpty(confirmPassword))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorConfirmPasswordRequired")
      );

    if (password !== confirmPassword)
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorPasswordAndConfirmAreNotEqual")
      );

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (!this.uniqueIdentifierProvider.isValid(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    if (this.passwordProvider.outOfBounds(password))
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorPasswordOutOfBounds", [
          this.passwordProvider.MIN_LENGTH,
          this.passwordProvider.MAX_LENGTH,
        ])
      );

    if (!this.passwordProvider.hasStrength(password))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPasswordToWeak"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorUserNotFound", [getMessage("RandomWord_User")])
      );

    if (!(await this.hashProvider.compare(oldPassword, hasUser.password)))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorResetPasswdOldPasswordInvalid")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: "ErrorEnvVarNotFound",
    });

    const [updated] = await transaction([
      this.userRepository.updatePassword({
        userId,
        password: await this.hashProvider.hash(password, hashSalt),
      }),
    ]);

    return !!updated;
  }
}

export { ChangePasswordService };
