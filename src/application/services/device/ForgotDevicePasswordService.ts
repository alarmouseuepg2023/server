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
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
import { ForgotDevicePasswordRequestModel } from "@infra/dtos/device/ForgotDevicePasswordRequestModel";
import { mailTransporter } from "@infra/mail";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IMaskProvider } from "@providers/mask";
import { IPasswordProvider } from "@providers/password";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class ForgotDevicePasswordService {
  constructor(
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
    private maskProvider: IMaskProvider,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository
  ) {}

  public async execute({
    userId,
    deviceId,
  }: ForgotDevicePasswordRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(deviceId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorDeviceIdRequired"));

    if (
      !this.uniqueIdentifierProvider.isValid(userId) ||
      !this.uniqueIdentifierProvider.isValid(deviceId)
    )
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

    const [hasUser] = await transaction([
      this.userRepository.getById({ id: userId }),
    ]);

    if (!hasUser)
      throw new AppError(
        "NOT_FOUND",
        getVariableMessage("ErrorUserNotFound", [getMessage("RandomWord_User")])
      );

    const [hasDevice] = await transaction([
      this.deviceRepository.getById({ deviceId }),
    ]);

    if (!hasDevice)
      throw new AppError("NOT_FOUND", getMessage("ErrorDeviceNotFound"));

    const hashSalt = toNumber({
      value: env("PASSWORD_HASH_SALT"),
      error: getMessage("ErrorEnvVarNotFound"),
    });

    const pin = this.passwordProvider.generatePin();

    const expiresIn = this.dateProvider.addMinutes(
      this.dateProvider.now(),
      ConstantsKeys.MINUTES_TO_RESET_DEVICE_PASSWORD
    );

    const [waitingEmailConfirmationCreated] = await transaction([
      this.waitingEmailConfirmationRepository.save({
        expiresIn,
        userId,
        pin: await this.hashProvider.hash(pin, hashSalt),
        operation: OperationsWithEmailConfirmationDomain.RESET_DEVICE_PASSWORD,
      }),
    ]);

    mailTransporter.sendMail({
      subject: getMessage("MailSentResetDevicePasswordNotificationSubject"),
      to: hasUser.email,
      html: getVariableMessage("MailSentResetDevicePasswordNotificationHtml", [
        hasDevice.nickname,
        pin,
        this.maskProvider.timestamp(expiresIn),
      ]),
    });

    return !!waitingEmailConfirmationCreated;
  }
}

export { ForgotDevicePasswordService };
