import { PushNotificationModel } from "@models/PushNotificationModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "./inputs/deleteInput";
import { getByDeviceInput } from "./inputs/getByDeviceInput";
import { getByIdInput } from "./inputs/getByIdInput";

interface IPushNotificationsRepository {
  save(
    _: PushNotificationModel & { userId: string }
  ): PrismaPromise<PushNotificationModel>;

  delete(_: deleteInput): PrismaPromise<PushNotificationModel>;

  getByDevice(
    _: getByDeviceInput
  ): PrismaPromise<(PushNotificationModel & { userId: string })[]>;

  getById(_: getByIdInput): PrismaPromise<PushNotificationModel | null>;
}

export { IPushNotificationsRepository };
