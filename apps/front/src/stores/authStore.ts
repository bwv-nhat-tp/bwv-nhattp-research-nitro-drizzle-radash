import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI, type LoginDto, type RegisterDto, type AuthData } from '../api/authAPI';
import { useRouter } from 'vue-router';
import { useLoadingStore } from './loadingStore';
import type { ApiErrorResponse } from '../api/types';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const loadingStore = useLoadingStore();

  const currentUser = ref<AuthData['user'] | null>(null);
  const token = ref<string | null>(localStorage.getItem('accessToken') || null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const setAuth = (authData: AuthData) => {
    currentUser.value = authData.user;
    token.value = authData.accessToken;
    localStorage.setItem('accessToken', authData.accessToken);
  };

  const clearAuth = () => {
    currentUser.value = null;
    token.value = null;
    localStorage.removeItem('accessToken');
  };

  const login = async (credentials: LoginDto) => {
    loadingStore.startLoading();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await authAPI.login(credentials);

      if (data.accessToken) {
        setAuth(data);
        return true;
      }
      error.value = 'Login failed';
      return false;
    } catch (err) {
      const typedErr = err as { response?: { data?: ApiErrorResponse } };
      error.value = typedErr?.response?.data?.message || 'Server connection error';
      return false;
    } finally {
      loading.value = false;
      loadingStore.stopLoading();
    }
  };

  const register = async (userInfo: RegisterDto) => {
    loadingStore.startLoading();
    loading.value = true;
    error.value = null;
    try {
      await authAPI.register(userInfo);
      return true;
    } catch (err) {
      const typedErr = err as { response?: { data?: ApiErrorResponse } };
      error.value = typedErr?.response?.data?.message || 'Server connection error';
      return false;
    } finally {
      loading.value = false;
      loadingStore.stopLoading();
    }
  };

  const logout = async () => {
    loadingStore.startLoading();
    loading.value = true;
    try {
      if (token.value) {
        await authAPI.logout();
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      clearAuth();
      loading.value = false;
      loadingStore.stopLoading();
      router.push({ name: 'Login' });
    }
  };

  const fetchCurrentUser = async () => {
    if (!token.value) return false;

    loadingStore.startLoading();
    loading.value = true;
    try {
      const { data } = await authAPI.getMe();
      currentUser.value = data;
      return true;
    } catch (err) {
      clearAuth();
      return false;
    } finally {
      loading.value = false;
      loadingStore.stopLoading();
    }
  };

  return {
    currentUser,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearAuth,
    fetchCurrentUser,
  };
});
