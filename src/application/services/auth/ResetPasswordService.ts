import { inject, injectable } from "inversify";

import { OperationsWithEmailConfirmationDomain } from "@domains/OperationsWithEmailConfirmationDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
import { ResetPasswordRequestModel } from "@infra/dtos/auth/ResetPasswordRequestModel";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IPasswordProvider } from "@providers/password";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ResetPasswordService {
  constructor(
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  public async execute({
    confirmPassword,
    password,
    pin,
    email,
  }: ResetPasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(pin))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPinRequired"));

    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailInvalid"));

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
      this.userRepository.hasEmail({ email }),
    ]);

    if (!hasUser)
      throw new AppError(
        "NOT_FOUND",
        getVariableMessage("ErrorUserNotFound", [getMessage("RandomWord_User")])
      );

    const [hasRequest] = await transaction([
      this.waitingEmailConfirmationRepository.getById({
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.RESET_PASSWORD,
      }),
    ]);

    if (!hasRequest)
      throw new AppError(
        "NOT_FOUND",
        getMessage("ErrorResetPasswordRequestNotFound")
      );

    if (!(await this.hashProvider.compare(pin, hasRequest.pin)))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorResetPasswordRequestPinInvalid")
      );

    if (
      this.dateProvider.isBefore(hasRequest.expiresIn, this.dateProvider.now())
    )
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorResetPasswordRequestTimeExpired")
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: getMessage("ErrorEnvVarNotFound"),
    });

    const [userUpdated, _] = await transaction([
      this.userRepository.updatePassword({
        userId: hasUser.id,
        password: await this.hashProvider.hash(password, hashSalt),
      }),
      this.waitingEmailConfirmationRepository.delete({
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.RESET_PASSWORD,
      }),
    ]);

    return !!userUpdated;
  }
}

export { ResetPasswordService };
