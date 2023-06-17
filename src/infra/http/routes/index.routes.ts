import { Router } from "express";

import { RoutesPrefix } from "@commons/RoutesPrefix";

import { routes as alarmEventsRoutes } from "./alarmEvents.routes";
import { routes as authRoutes } from "./auth.routes";
import { routes as deviceRoutes } from "./device.routes";
import { routes as guestRoutes } from "./guest.routes";
import { routes as inviteRoutes } from "./invite.routes";
import { routes as pushNotificationsRoutes } from "./pushNotifications.routes";
import { routes as userRoutes } from "./user.routes";

const routes = Router();

routes.use(RoutesPrefix.AUTH, authRoutes);
routes.use(RoutesPrefix.GUEST, guestRoutes);
routes.use(RoutesPrefix.USER, userRoutes);
routes.use(RoutesPrefix.DEVICE, deviceRoutes);
routes.use(RoutesPrefix.INVITE, inviteRoutes);
routes.use(RoutesPrefix.ALARM_EVENTS, alarmEventsRoutes);
routes.use(RoutesPrefix.PUSH_NOTIFICATIONS, pushNotificationsRoutes);

export { routes };
