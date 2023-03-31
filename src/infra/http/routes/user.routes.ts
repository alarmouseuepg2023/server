import { Router } from "express";
import { container } from "tsyringe";

import { UserController } from "@http/controllers/UserController";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new UserController();
const logMiddleware = new LogMiddleware();
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();
const ensureAuthenticated = container.resolve(
  EnsureUserAuthenticatedMiddleware
);

routes.post(
  "/",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  controller.create,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/changePassword",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.changePassword,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/delete/request",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.requestDeletion,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.delete(
  "/delete/confirm/:pin",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  ensureAuthenticated.execute,
  controller.confirmDeletion,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
