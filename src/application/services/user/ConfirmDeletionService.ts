import i18n from "i18n";
import { inject, injectable } from "tsyringe";

import { OperationsWithEmailConfirmationDomain } from "@domains/OperationsWithEmailConfirmationDomain";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { ConfirmUserDeletionRequestModel } from "@http/dtos/user/ConfirmUserDeletionRequestModel";
import { IDeviceRepository } from "@infra/database/repositories/device";
import { IUserRepository } from "@infra/database/repositories/user";
import { IWaitingEmailConfirmationRepository } from "@infra/database/repositories/waitingEmailConfirmation";
import { transaction } from "@infra/database/transaction";
import { IDateProvider } from "@providers/date";
import { IHashProvider } from "@providers/hash";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class ConfirmDeletionService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("WaitingEmailConfirmationRepository")
    private waitingEmailConfirmationRepository: IWaitingEmailConfirmationRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("DeviceRepository")
    private deviceRepository: IDeviceRepository
  ) {}

  public async execute({
    pin,
    userId,
  }: ConfirmUserDeletionRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(pin))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorPinRequired"));

    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (!this.uniqueIdentifierProvider.isValid(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasRequest] = await transaction([
      this.waitingEmailConfirmationRepository.getById({
        userId,
        operation: OperationsWithEmailConfirmationDomain.USER_DELETION,
      }),
    ]);

    if (!hasRequest)
      throw new AppError(
        "NOT_FOUND",
        i18n.__("ErrorDeletionUserAccountRequestNotFound")
      );

    if (!(await this.hashProvider.compare(pin, hasRequest.pin)))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorDeletionUserAccountRequestPinInvalid")
      );

    if (
      this.dateProvider.isBefore(hasRequest.expiresIn, this.dateProvider.now())
    )
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorDeletionUserAccountRequestTimeExpired")
      );

    const [_, userDeleted, ...__] = await transaction([
      this.waitingEmailConfirmationRepository.delete({
        userId,
        operation: OperationsWithEmailConfirmationDomain.USER_DELETION,
      }),
      this.deviceRepository.deleteByUser({ userId }),
      this.userRepository.delete({
        userId,
      }),
    ]);

    return !!userDeleted;
  }
}

export { ConfirmDeletionService };
