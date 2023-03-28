import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { OperationsWithEmailConfirmationDomain } from "@domains/OperationsWithEmailConfirmationDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { ForgotPasswordRequestModel } from "@http/dtos/auth/ForgotPasswordRequestModel";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
import { mailTransporter } from "@infra/mail";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IPasswordProvider } from "@providers/password";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class ForgotPasswordService {
  constructor(
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    email,
  }: ForgotPasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorEmailInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.hasEmail({ email }),
    ]);

    if (!hasUser)
      throw new AppError(
        "NOT_FOUND",
        i18n.__mf("ErrorUserNotFound", [i18n.__("RandomWord_User")])
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: i18n.__("ErrorEnvVarNotFound"),
    });

    const pin = this.passwordProvider.generatePin();

    const expiresIn = this.dateProvider.addMinutes(
      this.dateProvider.now(),
      ConstantsKeys.MINUTES_TO_RESET_PASSWORD
    );

    const [waitingEmailConfirmationCreated] = await transaction([
      this.waitingEmailConfirmationRepository.save({
        expiresIn,
        pin: await this.hashProvider.hash(pin, hashSalt),
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.RESET_PASSWORD,
      }),
    ]);

    mailTransporter.sendMail({
      subject: i18n.__("MailSentResetPasswordNotificationSubject"),
      to: hasUser.email,
      html: i18n.__mf("MailSentResetPasswordNotificationHtml", [
        pin,
        this.maskProvider.timestamp(expiresIn),
      ]),
    });

    return !!waitingEmailConfirmationCreated;
  }
}

export { ForgotPasswordService };
