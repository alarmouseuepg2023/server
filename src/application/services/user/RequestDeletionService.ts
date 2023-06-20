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
import { RequestUserDeletionRequestModel } from "@infra/dtos/user/RequestUserDeletionRequestModel";
import { mailTransporter } from "@infra/mail";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IPasswordProvider } from "@providers/password";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class RequestDeletionService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider
  ) {}

  public async execute({
    userId,
  }: RequestUserDeletionRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (!this.uniqueIdentifierProvider.isValid(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorUserNotFound", [getMessage("RandomWord_User")])
      );

    const pin = this.passwordProvider.generatePin();

    const expiresIn = this.dateProvider.addMinutes(
      this.dateProvider.now(),
      ConstantsKeys.MINUTES_TO_DELETE_ACCOUNT
    );

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: getMessage("ErrorEnvVarNotFound"),
    });

    const [waitingEmailConfirmationCreated] = await transaction([
      this.waitingEmailConfirmationRepository.save({
        expiresIn,
        pin: await this.hashProvider.hash(pin, hashSalt),
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.USER_DELETION,
      }),
    ]);

    mailTransporter.sendMail({
      subject: getMessage("MailSentDeleteAccountNotificationSubject"),
      to: hasUser.email,
      html: getVariableMessage("MailSentDeleteAccountNotificationHtml", [
        pin,
        this.maskProvider.timestamp(expiresIn),
      ]),
    });

    return !!waitingEmailConfirmationCreated;
  }
}

export { RequestDeletionService };
