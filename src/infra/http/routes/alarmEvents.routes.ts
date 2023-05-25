import { Router } from "express";

import { AlarmEventsController } from "@http/controllers/AlarmEventsController";
import { container } from "@infra/containers";
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

routes.post(
  "/:device_id",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.has(),
  controller.list,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
