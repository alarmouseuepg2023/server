import { BaseRepository } from "@infra/database/repositories/BaseRepository";
import { PushNotificationModel } from "@models/PushNotificationModel";
import { PrismaPromise } from "@prisma/client";

import { deleteInput } from "../../../models/inputs/deleteInput";
import { getByDeviceInput } from "../../../models/inputs/getByDeviceInput";
import { getByIdInput } from "../../../models/inputs/getByIdInput";
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

  public delete = ({
    userId,
  }: deleteInput): PrismaPromise<PushNotificationModel> =>
    this.prisma.pushNotifications.delete({
      where: {
        userId,
      },
    });

  public getByDevice = ({
    deviceId,
  }: getByDeviceInput): PrismaPromise<
    (PushNotificationModel & { userId: string })[]
  > =>
    this.prisma.pushNotifications.findMany({
      where: {
        user: {
          deviceAccessControl: {
            some: { deviceId },
          },
        },
      },
      select: {
        userId: true,
        fcmToken: true,
        notificationEnabled: true,
      },
    });

  public getById = ({
    userId,
  }: getByIdInput): PrismaPromise<PushNotificationModel | null> =>
    this.prisma.pushNotifications.findFirst({
      where: {
        userId,
      },
    });
}

export { PushNotificationsRepository };
