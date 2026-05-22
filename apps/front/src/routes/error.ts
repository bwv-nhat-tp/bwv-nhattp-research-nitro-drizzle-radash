import type { RouteRecordRaw } from "vue-router";

export default <RouteRecordRaw>{
  path: "/error",
  component: () => import("@/layouts/RouterBypass.vue"),
  children: [
    {
      path: "",
      name: "NotFound",
      meta: { title: "Not Found", auth: null },
      component: () => import("@/views/NotFound.vue"),
    },
  ],
};
