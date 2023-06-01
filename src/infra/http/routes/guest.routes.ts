import { Router } from "express";

import { RolesKeys } from "@commons/RolesKey";
import { GuestController } from "@http/controllers/GuestConstroller";
import { container } from "@infra/containers";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
  RBACMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new GuestController();
const logMiddleware = new LogMiddleware();
const RBAC = container.resolve(RBACMiddleware);
const ensureAuthenticated = container.resolve(
  EnsureUserAuthenticatedMiddleware
);
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();

routes.get(
  "/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.list,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/revoke/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.revokePermission,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/exit/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.GUEST),
  controller.guestExit,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
export { routes };
