import { Router } from "express";
import { container } from "tsyringe";

import { RolesKeys } from "@commons/RolesKey";
import { InviteController } from "@http/controllers/InviteController";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
  RBACMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new InviteController();
const logMiddleware = new LogMiddleware();
const RBAC = container.resolve(RBACMiddleware);
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();
const ensureAuthenticated = container.resolve(
  EnsureUserAuthenticatedMiddleware
);

routes.post(
  "/:guest_id",
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  RBAC.is(RolesKeys.OWNER),
  controller.create,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
