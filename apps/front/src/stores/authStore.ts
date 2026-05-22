import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { AuthData } from "../services";

export const useAuthStore = defineStore("auth", () => {
  const currentUser = ref<AuthData["user"] | null>(null);
  const token = ref<string | null>(localStorage.getItem("accessToken") || null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const setAuth = (authData: AuthData) => {
    currentUser.value = authData.user;
    token.value = authData.accessToken;
    localStorage.setItem("accessToken", authData.accessToken);
  };

  const setCurrentUser = (user: AuthData["user"] | null) => {
    currentUser.value = user;
  };

  const clearAuth = () => {
    currentUser.value = null;
    token.value = null;
    localStorage.removeItem("accessToken");
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (value: string | null) => {
    error.value = value;
  };

  const setToken = (value: string | null) => {
    token.value = value;
    if (value) localStorage.setItem("accessToken", value);
    else localStorage.removeItem("accessToken");
  };

  return {
    currentUser,
    token,
    loading,
    error,
    isAuthenticated,
    clearAuth,
    setAuth,
    setCurrentUser,
    setError,
    setLoading,
    setToken,
  };
});
