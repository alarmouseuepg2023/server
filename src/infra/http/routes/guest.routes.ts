import { Router } from "express";
import { container } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { GuestController } from "@http/controllers/GuestConstroller";
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

routes.post(
  "/revoke/:device_id",
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.revokePermission,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
export { routes };
