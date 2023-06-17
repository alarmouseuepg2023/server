import { PushNotificationModel } from "@models/PushNotificationModel";
import { PrismaPromise } from "@prisma/client";

interface IPushNotificationsRepository {
  save(
    _: PushNotificationModel & { userId: string }
  ): PrismaPromise<PushNotificationModel>;
}

export { IPushNotificationsRepository };
