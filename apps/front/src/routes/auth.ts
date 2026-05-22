import { APP_ROUTES } from "@intern/factory";
import type { RouteRecordRaw } from "vue-router";

export default <RouteRecordRaw>{
  path: "/",
  component: () => import("@/layouts/AuthLayout.vue"),
  children: [
    {
      path: "login",
      name: APP_ROUTES.FRONTEND.LOGIN,
      meta: { title: APP_ROUTES.FRONTEND.LOGIN, auth: false },
      component: () => import("@/views/Login.vue"),
    },
    {
      path: "register",
      name: APP_ROUTES.FRONTEND.REGISTER,
      meta: { title: APP_ROUTES.FRONTEND.REGISTER, auth: false },
      component: () => import("@/views/Register.vue"),
    },
  ],
};
