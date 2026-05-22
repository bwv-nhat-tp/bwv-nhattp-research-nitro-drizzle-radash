<template>
  <header class="app-header">
    <div class="header-spacer"></div>

    <div v-if="authStore.isAuthenticated" class="dashboard-stats">
      <div class="stat-box">
        <span class="stat-label">Total Users:</span>
        <span class="stat-value">{{ userStore.totalUsers }}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Total Balance:</span>
        <span class="stat-value">{{ formattedTotalBalance }}</span>
      </div>

      <button class="logout-btn" :disabled="isLoggingOut" @click="handleLogout">
        <i class="pi pi-sign-out"></i> Logout
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, inject, watch } from "vue";
import { useRouter } from "vue-router";

import { useMutation } from "../composables";
import { authService } from "../services";
import { useAuthStore } from "../stores/authStore";
import { useLoadingStore } from "../stores/loadingStore";
import { useUserStore } from "../stores/userStore";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const loadingStore = useLoadingStore();
const { mutate: logout, isLoading: isLoggingOut } = useMutation(
  authService.logout,
);
interface AppConfig {
  locale: string;
}
const appConfig = inject<AppConfig | undefined>("appConfig");

const formattedTotalBalance = computed(() => {
  if (!appConfig) return `$${userStore.totalBalance.toFixed(2)}`;
  const currency = appConfig.locale === "ja-JP" ? "JPY" : "USD";
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency,
  }).format(userStore.totalBalance);
});

watch(isLoggingOut, (value) => {
  authStore.setLoading(value);
  if (value) loadingStore.startLoading();
  else loadingStore.stopLoading();
});

const handleLogout = async () => {
  if (authStore.token) {
    await logout();
  }
  authStore.clearAuth();
  router.push({ name: "Login" });
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e293b;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.header-spacer {
  flex: 1;
}
.dashboard-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.stat-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #38bdf8;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  transition: background-color 0.2s;
}
.logout-btn:hover {
  background-color: #dc2626;
}
.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
