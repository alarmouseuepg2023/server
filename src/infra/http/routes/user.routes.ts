import { Router } from "express";

import { UserController } from "@http/controllers/UserController";
import {
  HandleUrlPatternMatchMiddleware,
  LogMiddleware,
} from "@middlewares/index";

const routes = Router();
const controller = new UserController();
const logMiddleware = new LogMiddleware();
const handleUrlPatternMatchMiddleware = new HandleUrlPatternMatchMiddleware();

routes.post(
  "/",
  logMiddleware.routeStart,
  controller.create,
  handleUrlPatternMatchMiddleware.setHasUrlMatched()
);

export { routes };
