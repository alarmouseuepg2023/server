import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { VarcharMaxLength } from "@commons/VarcharMaxLength";
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
import { CreateBlockedUserRequestModel } from "@infra/dtos/user/CreateBlockedUserRequestModel";
import { mailTransporter } from "@infra/mail";
import { UserModel } from "@models/UserModel";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IPasswordProvider } from "@providers/password";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class BlockedUserCreationService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    confirmPassword,
    email,
    name,
    password,
  }: CreateBlockedUserRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(name))
      throw new AppError("BAD_REQUEST", getMessage("ErrorNameRequired"));

    if (!this.validatorsProvider.length(name, VarcharMaxLength.USER_NAME))
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorVarCharMaxLengthExceeded", [
          getMessage("RandomWord_Name"),
          VarcharMaxLength.USER_NAME,
        ])
      );

    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailInvalid"));

    if (!this.validatorsProvider.length(email, VarcharMaxLength.USER_EMAIL))
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorVarCharMaxLengthExceeded", [
          getMessage("RandomWord_Email"),
          VarcharMaxLength.USER_EMAIL,
        ])
      );

    if (stringIsNullOrEmpty(password))
      throw new AppError("BAD_REQUEST", getMessage("ErrorPasswordRequired"));

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

    const [hasEmail] = await transaction([
      this.userRepository.hasEmail({ email }),
    ]);

    if (hasEmail)
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailAlreadyExists"));

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: getMessage("ErrorEnvVarNotFound"),
    });

    const pin = this.passwordProvider.generatePin();
    const id = this.uniqueIdentifierProvider.generate();
    const expiresIn = this.dateProvider.addMinutes(
      this.dateProvider.now(),
      ConstantsKeys.MINUTES_TO_CONFIRM_USER_CREATION
    );

    const [userCreated, _] = await transaction([
      this.userRepository.save({
        id,
        name,
        email,
        password: await this.hashProvider.hash(password, hashSalt),
      } as UserModel),
      this.waitingEmailConfirmationRepository.save({
        expiresIn,
        userId: id,
        pin: await this.hashProvider.hash(pin, hashSalt),
        operation: OperationsWithEmailConfirmationDomain.CONFIRM_USER_CREATION,
      }),
    ]);

    mailTransporter.sendMail({
      subject: getMessage("MailSentCompleteUserCreationNotificationSubject"),
      to: userCreated.email,
      html: getVariableMessage("MailSentCompleteUserCreationNotificationHtml", [
        userCreated.name,
        pin,
        this.maskProvider.timestamp(expiresIn),
      ]),
    });

    return !!userCreated;
  }
}

export { BlockedUserCreationService };
