import { Router } from "express";

import { RolesKeys } from "@commons/RolesKey";
import { TopicsMQTT } from "@commons/TopicsMQTT";
import { DeviceController } from "@controllers/DeviceController";
import { container } from "@infra/containers";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
  RBACMiddleware,
  downloadFileAndUnlinkMiddleware,
  isSupportMiddleware,
  throwAppError2MQTTMiddleware,
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
  throwAppError2MQTTMiddleware(TopicsMQTT.EMBEDDED_ERROR_AT_CREATE_DEVICE),
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
  "/changePassword/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.has(),
  controller.changePassword,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/authentication/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.has(),
  controller.authentication,
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
routes.post(
  "/wifiChangeHaveStarted/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.wifiChangeHaveStarted,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.delete(
  "/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.delete,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.get(
  "/generateQr/:support/:pin",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  isSupportMiddleware,
  controller.generateQrCode,
  downloadFileAndUnlinkMiddleware,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
