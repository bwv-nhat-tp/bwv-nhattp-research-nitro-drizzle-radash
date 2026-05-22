import type { RouteRecordRaw } from "vue-router";

import appRoutes from "./app";
import authRoutes from "./auth";
import errorRoutes from "./error";

const routes: RouteRecordRaw[] = [authRoutes, appRoutes, errorRoutes];

export default routes;
