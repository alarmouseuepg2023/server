import { Router } from "express";
import { container } from "tsyringe";

import { DeviceController } from "@controllers/DeviceController";
import { EnsureUserAuthenticatedMiddleware } from "@middlewares/EnsureUserAuthenticatedMiddleware";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new DeviceController();
const logMiddleware = new LogMiddleware();
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

export { routes };
