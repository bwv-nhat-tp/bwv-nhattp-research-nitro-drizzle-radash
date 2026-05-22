<template>
  <AuthLayout
    :title="APP_ROUTES.FRONTEND.LOGIN"
    icon="pi pi-user"
    :submit-label="APP_ROUTES.FRONTEND.LOGIN"
    :loading="isLoggingIn"
    :error="loginErrorMessage"
    footer-text="Don't have an account?"
    footer-link-text="Sign up now"
    footer-route="/register"
    @submit="handleLogin"
  >
    <div class="field">
      <span class="p-input-icon-left w-full">
        <InputText
          v-model="form.email"
          type="email"
          placeholder="Email"
          class="w-full"
          required
        />
      </span>
    </div>

    <div class="field">
      <span class="p-input-icon-left w-full">
        <Password
          v-model="form.password"
          placeholder="Mật khẩu"
          :feedback="false"
          toggle-mask
          class="w-full"
          input-class="w-full"
          required
        />
      </span>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { APP_ROUTES } from "@intern/factory";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";

import AuthLayout from "../components/AuthLayout.vue";
import { useMutation } from "../composables";
import { type ApiErrorResponse, authService } from "../services";
import { useAuthStore } from "../stores/authStore";
import { useLoadingStore } from "../stores/loadingStore";

const router = useRouter();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const form = reactive({ email: "", password: "" });
const {
  result: loginResult,
  mutate: login,
  isLoading: isLoggingIn,
  error: loginError,
} = useMutation(authService.login);

const loginErrorMessage = computed(() => {
  const typedError = loginError.value as {
    response?: { data?: ApiErrorResponse };
  } | null;

  return typedError?.response?.data?.message || null;
});

watch(isLoggingIn, (value) => {
  authStore.setLoading(value);
  if (value) loadingStore.startLoading();
  else loadingStore.stopLoading();
});

const handleLogin = async () => {
  await login({
    email: form.email,
    password: form.password,
  });
  if (!loginError.value && loginResult.value) {
    authStore.setAuth(loginResult.value);
    router.push({ name: APP_ROUTES.FRONTEND.DASHBOARD });
  }
};
</script>
