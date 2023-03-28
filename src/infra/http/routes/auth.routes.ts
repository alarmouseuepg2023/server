import { Router } from "express";

import { AuthController } from "@http/controllers/AuthController";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new AuthController();
const logMiddleware = new LogMiddleware();
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();

routes.post(
  "/",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  controller.login,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/refresh",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  controller.refreshToken,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/forgotPassword",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  controller.forgotPassword,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);
routes.post(
  "/resetPassword",
  handleUrlPatternMatchMiddleware.skipIfHasUrlMatched,
  logMiddleware.routeStart,
  controller.resetPassword,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
