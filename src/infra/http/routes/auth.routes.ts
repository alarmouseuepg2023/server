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
  logMiddleware.routeStart,
  controller.login,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
