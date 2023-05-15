import i18n from "i18n";
import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { OperationsWithEmailConfirmationDomain } from "@domains/OperationsWithEmailConfirmationDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { CreateBlockedUserRequestModel } from "@http/dtos/user/CreateBlockedUserRequestModel";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
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
      subject: i18n.__("MailSentCompleteUserCreationNotificationSubject"),
      to: userCreated.email,
      html: i18n.__mf("MailSentCompleteUserCreationNotificationHtml", [
        userCreated.name,
        pin,
        this.maskProvider.timestamp(expiresIn),
      ]),
    });

    return !!userCreated;
  }
}

export { BlockedUserCreationService };
