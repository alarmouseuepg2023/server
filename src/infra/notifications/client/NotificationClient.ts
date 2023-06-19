import admin, {
  messaging,
  credential,
  app as firebaseApp,
} from "firebase-admin";
import { inject, injectable } from "inversify";

import { env } from "@helpers/env";
import { getErrorStackTrace } from "@helpers/getErrorStackTrace";
import { stringIsNullOrEmpty } from "@helpers/stringIsNullOrEmpty";
import { IPushNotificationsRepository } from "@infra/database/repositories/pushNotification";
import { transaction } from "@infra/database/transaction";
import { logger } from "@infra/log";
import { PushNotificationModel } from "@models/PushNotificationModel";
import { IUniqueIdentifierProvider } from "@providers/uniqueIdentifier";

@injectable()
class NotificationClient {
  private readonly firebaseApp: firebaseApp.App;

  private readonly defaultOptions: messaging.AndroidConfig = {
    ttl: 3600,
    priority: "normal",
  };

  constructor(
    @inject("PushNotificationsRepository")
    private pushNotificationsRepository: IPushNotificationsRepository,
    @inject("UniqueIdentifierProvider")
    private uniqueIdentifierProvider: IUniqueIdentifierProvider
  ) {
    this.firebaseApp = admin.initializeApp({
      credential: credential.cert({
        clientEmail: env("NOTIFICATIONS_CLIENT_EMAIL"),
        privateKey: env("NOTIFICATIONS_PRIVATE_KEY"),
        projectId: env("NOTIFICATIONS_PROJECT_ID"),
      }),
    });
  }

  private onSuccessNotificationCb = (response: string): void => {
    logger.info(
      `Response at firebase app sending push notification: ${response}`
    );
  };

  private onErrorNotificationCb = async (
    error: any,
    userId: string
  ): Promise<void> => {
    logger.error(
      `Error at firebase app sending push notification: ${getErrorStackTrace(
        error
      )}`
    );

    const regex =
      /^The registration token is not a valid FCM registration token$/;

    if (
      !stringIsNullOrEmpty(error.message) &&
      this.uniqueIdentifierProvider.isValid(userId) &&
      regex.test(error.message)
    )
      await transaction([this.pushNotificationsRepository.delete({ userId })]);
  };

  public send = ({
    notification,
    token,
    android,
    userId,
  }: messaging.TokenMessage & { userId: string }): void => {
    logger.info(
      `Firebase app sending push notification: ${
        notification?.title || "WITHOUT TITLE"
      }`
    );

    this.firebaseApp
      .messaging()
      .send({
        token,
        notification,
        android: android ?? this.defaultOptions,
      })
      .then(this.onSuccessNotificationCb)
      .catch((e) => this.onErrorNotificationCb(e, userId));
  };

  public sendAll = (
    receivers: (PushNotificationModel & { userId: string })[],
    notification: messaging.Notification,
    options: messaging.AndroidConfig | undefined = undefined
  ): void => {
    const count = receivers.reduce(
      (acc, { userId, fcmToken, notificationEnabled }): number => {
        if (!notificationEnabled) return acc;

        this.send({
          notification,
          android: options,
          token: fcmToken,
          userId,
        });

        return acc + 1;
      },
      0
    );

    logger.info(`Firebase app sending push notification to ${count} receivers`);
  };
}

export { NotificationClient };
