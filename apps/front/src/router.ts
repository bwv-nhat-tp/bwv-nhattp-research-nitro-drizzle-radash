import { APP_ROUTES } from "@intern/factory";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { useAuthStore } from "@/stores/authStore";

import allRoutes from "./routes";

const routes: RouteRecordRaw[] = [...allRoutes];

routes.push(
  {
    path: "/",
    redirect: { name: APP_ROUTES.FRONTEND.DASHBOARD },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: () => ({
      name: "NotFound",
      query: {},
      replace: true,
    }),
  },
);

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const title = to.meta.title as string | undefined;
  document.title = title || "User Management";
  to.meta.resolvedTitle = title;

  const auth =
    to.meta.auth !== null && to.meta.auth !== undefined ? to.meta.auth : true;
  const authStore = useAuthStore();

  if (!auth && authStore.isAuthenticated) {
    return { name: APP_ROUTES.FRONTEND.DASHBOARD };
  }

  if (auth && !authStore.isAuthenticated) {
    return {
      name: APP_ROUTES.FRONTEND.LOGIN,
      query: { redirectUrl: encodeURIComponent(to.fullPath) },
    };
  }

  return true;
});

export default router;
