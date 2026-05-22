<template>
  <div class="sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <span class="logo-text">User Management</span>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/users" class="nav-item" active-class="active">
        <i class="pi pi-home"></i>
        <span class="nav-label">Dashboard</span>
      </router-link>
      <router-link
        v-if="userId"
        :to="{ name: 'UserProfile', params: { id: userId } }"
        class="nav-item"
        active-class="active"
      >
        <i class="pi pi-user"></i>
        <span class="nav-label">User Profile</span>
      </router-link>
      <router-link to="/transactions" class="nav-item" active-class="active">
        <i class="pi pi-list"></i>
        <span class="nav-label">Transactions Logs</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useAuthStore } from "../stores/authStore";

defineProps<{ collapsed: boolean }>();

const authStore = useAuthStore();
const userId = computed(() => authStore.currentUser?.id);
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar.collapsed .logo-text,
.sidebar.collapsed .nav-label {
  display: none;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 20px 0;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 12px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.nav-item i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
}
</style>
