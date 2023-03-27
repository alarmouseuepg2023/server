import { Router } from "express";
import { container } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { AlarmEventsController } from "@http/controllers/AlarmEventsController";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
  RBACMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new AlarmEventsController();
const logMiddleware = new LogMiddleware();
const RBAC = container.resolve(RBACMiddleware);
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();
const ensureAuthenticated = container.resolve(
  EnsureUserAuthenticatedMiddleware
);

routes.get(
  "/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.list,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
