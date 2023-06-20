import { inject, injectable } from "inversify";

import { VarcharMaxLength } from "@commons/VarcharMaxLength";
import { AppError } from "@handlers/error/AppError";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import {
  getMessage,
  getVariableMessage,
} from "@helpers/translatedMessagesControl";
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
      throw new AppError("BAD_REQUEST", getMessage("ErrorUserIdRequired"));

    if (stringIsNullOrEmpty(token))
      throw new AppError(
        "BAD_REQUEST",
        getMessage("ErrorPushNotificationFCMTokenRequired")
      );

    if (
      !this.validatorsProvider.length(
        token,
        VarcharMaxLength.PUSH_NOTIFICATIONS_TOKEN
      )
    )
      throw new AppError(
        "BAD_REQUEST",
        getVariableMessage("ErrorVarCharMaxLengthExceeded", [
          getMessage("RandomWord_FCMToken"),
          VarcharMaxLength.PUSH_NOTIFICATIONS_TOKEN,
        ])
      );

    if (!this.uniqueIdentifierProvider.isValid(userId))
      throw new AppError("BAD_REQUEST", getMessage("ErrorUUIDInvalid"));

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
