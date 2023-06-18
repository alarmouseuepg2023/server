import { PushNotificationModel } from "@models/PushNotificationModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "./inputs/deleteInput";

interface IPushNotificationsRepository {
  save(
    _: PushNotificationModel & { userId: string }
  ): PrismaPromise<PushNotificationModel>;

  delete(_: deleteInput): PrismaPromise<PushNotificationModel>;
}

export { IPushNotificationsRepository };
