import { Router } from "express";

import { RoutesPrefix } from "@commons/RoutesPrefix";

import { routes as authRoutes } from "./auth.routes";

const routes = Router();

routes.use(RoutesPrefix.AUTH, authRoutes);

export { routes };
