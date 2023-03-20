import { Router } from "express";

import { RoutesPrefix } from "@commons/RoutesPrefix";

import { routes as authRoutes } from "./auth.routes";
import { routes as userRoutes } from "./user.routes";

const routes = Router();

routes.use(RoutesPrefix.AUTH, authRoutes);
routes.use(RoutesPrefix.USER, userRoutes);

export { routes };
