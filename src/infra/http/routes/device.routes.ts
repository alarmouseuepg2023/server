import { Router } from "express";
import { container } from "tsyringe";

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
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.save,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.get(
  "/",
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.list,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/resetPassword/:device_id",
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.has(),
  controller.resetPassword,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
