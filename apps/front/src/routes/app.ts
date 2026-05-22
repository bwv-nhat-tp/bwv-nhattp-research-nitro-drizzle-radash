import { APP_ROUTES } from "@intern/factory";
import type { RouteRecordRaw } from "vue-router";

export default <RouteRecordRaw>{
  path: "/",
  component: () => import("@/layouts/AppLayout.vue"),
  meta: { auth: true },
  children: [
    {
      path: "users",
      name: APP_ROUTES.FRONTEND.DASHBOARD,
      meta: { title: "Users" },
      component: () => import("@/views/Dashboard.vue"),
    },
    {
      path: "users/:id",
      name: APP_ROUTES.FRONTEND.USER_PROFILE,
      props: true,
      meta: { title: "User Profile" },
      component: () => import("@/views/UserProfile.vue"),
    },
    {
      path: "transactions",
      name: APP_ROUTES.FRONTEND.TRANSACTIONS_LOGS,
      meta: { title: "Transaction History" },
      component: () => import("@/views/TransactionLogs.vue"),
    },
  ],
};
