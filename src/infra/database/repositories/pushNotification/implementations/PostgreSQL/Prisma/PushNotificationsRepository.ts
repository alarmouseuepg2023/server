import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { PushNotificationModel } from "@models/PushNotificationModel";
import { PrismaPromise } from "@prisma/client";

import { IPushNotificationsRepository } from "../../../models/IPushNotificationsRepository";

class PushNotificationsRepository
  extends BaseRepository
  implements IPushNotificationsRepository
{
  public save = ({
    fcmToken,
    notificationEnabled,
    userId,
  }: PushNotificationModel & {
    userId: string;
  }): PrismaPromise<PushNotificationModel> =>
    this.prisma.pushNotifications.upsert({
      where: { userId },
      create: {
        userId,
        fcmToken,
      },
      update: {
        fcmToken,
        notificationEnabled,
      },
    });
}

export { PushNotificationsRepository };
