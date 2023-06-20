import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
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
import { ForgotPasswordRequestModel } from "@infra/dtos/auth/ForgotPasswordRequestModel";
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
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailRequired"));

    if (!this.validatorsProvider.email(email))
      throw new AppError("BAD_REQUEST", getMessage("ErrorEmailInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.hasEmail({ email }),
    ]);

    if (!hasUser)
      throw new AppError(
        "NOT_FOUND",
        getVariableMessage("ErrorUserNotFound", [getMessage("RandomWord_User")])
      );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: getMessage("ErrorEnvVarNotFound"),
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
      subject: getMessage("MailSentResetPasswordNotificationSubject"),
      to: hasUser.email,
      html: getVariableMessage("MailSentResetPasswordNotificationHtml", [
        pin,
        this.maskProvider.timestamp(expiresIn),
      ]),
    });

    return !!waitingEmailConfirmationCreated;
  }
}

export { ForgotPasswordService };
