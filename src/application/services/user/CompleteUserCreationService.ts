import i18n from "i18n";
import { inject, injectable } from "inversify";

import { ConstantsKeys } from "@commons/ConstantsKeys";
import { OperationsWithEmailConfirmationDomain } from "@domains/OperationsWithEmailConfirmationDomain";
import { AppError } from "@handlers/error/AppError";
import { env } from "@helpers/env";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { toNumber } from "@helpers/toNumber";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
import { CompleteUserCreationRequestModel } from "@infra/dtos/user/CompleteUserCreationRequestModel";
import { CompleteUserCreationResponseModel } from "@infra/dtos/user/CompleteUserCreationResponseModel";
import { mailTransporter } from "@infra/mail";
import { IAuthTokenPayload, IAuthTokenProvider } from "@providers/authToken";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IPasswordProvider } from "@providers/password";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class CompleteUserCreationService {
  constructor(
    @inject("AuthTokenProvider")
    private authTokenProvider: IAuthTokenProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("MaskProvider")
    private maskProvider: IMaskProvider,
    @inject("PasswordProvider")
    private passwordProvider: IPasswordProvider
  ) {}

  public async execute({
    email,
    pin,
  }: CompleteUserCreationRequestModel): Promise<CompleteUserCreationResponseModel> {
    if (stringIsNullOrEmpty(pin))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPinRequired"));

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

    const [hasRequest] = await transaction([
      this.waitingEmailConfirmationRepository.getById({
        userId: hasUser.id,
        operation: OperationsWithEmailConfirmationDomain.CONFIRM_USER_CREATION,
      }),
    ]);

    if (!hasRequest)
      throw new AppError(
        "NOT_FOUND",
        i18n.__("ErrorCompleteUserCreationRequestNotFound")
      );

    if (!(await this.hashProvider.compare(pin, hasRequest.pin)))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorCompleteUserCreationRequestPinInvalid")
      );

    if (
      this.dateProvider.isBefore(hasRequest.expiresIn, this.dateProvider.now())
    ) {
      const newPin = this.passwordProvider.generatePin();
      const newExpiresIn = this.dateProvider.addMinutes(
        this.dateProvider.now(),
        ConstantsKeys.MINUTES_TO_CONFIRM_USER_CREATION
      );

      const hashSalt = toNumber({
        value: env("PASSWORD_HASH_SALT"),
        error: i18n.__("ErrorEnvVarNotFound"),
      });

      await transaction([
        this.waitingEmailConfirmationRepository.save({
          expiresIn: newExpiresIn,
          pin: await this.hashProvider.hash(newPin, hashSalt),
          operation:
            OperationsWithEmailConfirmationDomain.CONFIRM_USER_CREATION,
          userId: hasUser.id,
        }),
      ]);

      mailTransporter.sendMail({
        subject: i18n.__("MailSentCompleteUserCreationNotificationSubject"),
        to: hasUser.email,
        html: i18n.__mf("MailSentCompleteUserCreationNotificationHtml", [
          hasUser.name,
          newPin,
          this.maskProvider.timestamp(newExpiresIn),
        ]),
      });

      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorCompleteUserCreationRequestTimeExpired")
      );
    }

    const [_, __] = await transaction([
      this.userRepository.updateLoginControlProps({
        userId: hasUser.id,
        blocked: false,
        attempts: 0,
        loginFailedDate: null,
      }),
      this.waitingEmailConfirmationRepository.delete({
        operation: OperationsWithEmailConfirmationDomain.CONFIRM_USER_CREATION,
        userId: hasUser.id,
      }),
    ]);

    const accessToken = this.authTokenProvider.generate({
      id: hasUser.id,
      name: hasUser.name,
      type: "accessToken",
    } as IAuthTokenPayload);

    const refreshToken = this.authTokenProvider.generate({
      id: hasUser.id,
      type: "refreshToken",
    } as IAuthTokenPayload);

    return {
      accessToken,
      refreshToken,
    };
  }
}

export { CompleteUserCreationService };
