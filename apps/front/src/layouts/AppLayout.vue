<template>
  <div class="layout-wrapper">
    <AppSidebar :collapsed="collapsed" />

    <div class="layout-content" :class="{ 'sidebar-collapsed': collapsed }">
      <AppHeader @toggle-sidebar="collapsed = !collapsed" />

      <main id="content">
        <div class="page-title-container">
          <h1 class="page-title">{{ route.meta.resolvedTitle }}</h1>
        </div>
        <div class="page-layout">
          <router-view :key="$route.fullPath" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppHeader from "@/components/AppHeader.vue";
import AppSidebar from "@/components/AppSidebar.vue";
import { useLazyQuery } from "@/composables";
import { authService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { useLoadingStore } from "@/stores/loadingStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const collapsed = ref(false);

const { result, refetch, error, isLoading } = useLazyQuery(authService.getMe);

watch(isLoading, (value) => {
  if (value) loadingStore.startLoading();
  else loadingStore.stopLoading();
});

watch(
  () => route.fullPath,
  async () => {
    if (!authStore.token) return;
    await refetch();
    if (error.value) {
      authStore.clearAuth();
      router.push({ name: "Login" });
      return;
    }
    authStore.setCurrentUser(result.data);
  },
  { immediate: true },
);
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #ffffff;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.layout-content.sidebar-collapsed {
  margin-left: 60px;
}

#content {
  flex: 1;
  background-color: #f8f9fa;
}

.page-title-container {
  width: 100%;
  padding: 1rem 1.5rem 0;
  text-align: center;
}

.page-title {
  margin: 0;
  color: #334155;
  font-size: 1.5rem;
  font-weight: 700;
}

.page-layout {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .layout-content,
  .layout-content.sidebar-collapsed {
    margin-left: 0;
  }

  .page-layout {
    padding: 1rem;
  }
}
</style>
