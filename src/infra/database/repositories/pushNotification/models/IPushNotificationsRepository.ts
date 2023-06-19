import { PushNotificationModel } from "@models/PushNotificationModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "./inputs/deleteInput";
import { getByDeviceInput } from "./inputs/getByDeviceInput";

interface IPushNotificationsRepository {
  save(
    _: PushNotificationModel & { userId: string }
  ): PrismaPromise<PushNotificationModel>;

  delete(_: deleteInput): PrismaPromise<PushNotificationModel>;

  getByDevice(
    _: getByDeviceInput
  ): PrismaPromise<(PushNotificationModel & { userId: string })[]>;
}

export { IPushNotificationsRepository };
