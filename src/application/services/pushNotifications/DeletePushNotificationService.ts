import i18n from "i18n";
import { inject, injectable } from "inversify";

import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IPushNotificationsRepository } from "@infra/database/repositories/pushNotifications";
import { transaction } from "@infra/database/transaction";
import { DeletePushNotificationRequestModel } from "@infra/dtos/pushNotifications/DeletePushNotificationRequestModel";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class DeletePushNotificationService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("PushNotificationsRepository")
    private pushNotificationsRepository: IPushNotificationsRepository
  ) {}

  public async execute({
    userId,
  }: DeletePushNotificationRequestModel): Promise<boolean> {
    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (!this.uniqueIdentifierProvider.isValid(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [hasPushNotification] = await transaction([
      this.pushNotificationsRepository.getById({ userId }),
    ]);

    if (!hasPushNotification)
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorPushNotificationNotFound")
      );

    const [deleted] = await transaction([
      this.pushNotificationsRepository.delete({ userId }),
    ]);

    return !!deleted;
  }
}

export { DeletePushNotificationService };
