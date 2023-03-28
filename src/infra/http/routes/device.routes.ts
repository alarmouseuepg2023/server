import { Router } from "express";
import { container } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { DeviceController } from "@controllers/DeviceController";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
  RBACMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new DeviceController();
const logMiddleware = new LogMiddleware();
const RBAC = container.resolve(RBACMiddleware);
const ensureAuthenticated = container.resolve(
  EnsureUserAuthenticatedMiddleware
);
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();

routes.post(
  "/",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.save,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.get(
  "/",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.list,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/status/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.has(),
  controller.changeStatus,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/resetPassword/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.has(),
  controller.resetPassword,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.patch(
  "/changeWifi/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.changeWifi,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.patch(
  "/changeNickname/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.changeNickname,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
