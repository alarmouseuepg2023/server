import i18n from "i18n";
import { inject, injectable } from "inversify";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IPushNotificationsRepository } from "@infra/database/repositories/pushNotifications";
import { transaction } from "@infra/database/transaction";
import { UpdatePushNotificationFCMTokenRequestModel } from "@infra/dtos/pushNotifications/UpdatePushNotificationFCMTokenRequestModel";
import { UpdatePushNotificationFCMTokenResponseModel } from "@infra/dtos/pushNotifications/UpdatePushNotificationFCMTokenResponseModel";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";
import { IValidatorsProvider } from "@providers/validators";

@injectable()
class UpdatePushNotificationFCMTokenService {
  constructor(
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider,
    @inject("PushNotificationsRepository")
    private pushNotificationsRepository: IPushNotificationsRepository,
    @inject("ValidatorsProvider")
    private validatorsProvider: IValidatorsProvider
  ) {}

  public async execute({
    token,
    userId,
  }: UpdatePushNotificationFCMTokenRequestModel): Promise<UpdatePushNotificationFCMTokenResponseModel> {
    if (stringIsNullOrEmpty(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(token))
      throw new AppError(
        "BAD_REQUEST",
        i18n.__("ErrorPushNotificationFCMTokenRequired")
      );

    if (
      !this.validatorsProvider.length(
        token,
        VarcharMaxLength.PUSH_NOTIFICATIONS_TOKEN
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        i18n.__mf("ErrorVarCharMaxLengthExceeded", [
          i18n.__("RandomWord_FCMToken"),
          VarcharMaxLength.PUSH_NOTIFICATIONS_TOKEN,
        ])
      );

    if (!this.uniqueIdentifierProvider.isValid(userId))
      throw new AppError("BAD_REQUEST", i18n.__("ErrorUUIDInvalid"));

    const [updated] = await transaction([
      this.pushNotificationsRepository.save({
        fcmToken: token,
        userId,
        notificationEnabled: true,
      }),
    ]);

    return {
      ...updated,
      userId,
    };
  }
}

export { UpdatePushNotificationFCMTokenService };
