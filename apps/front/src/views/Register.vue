<template>
  <AuthLayout
    :title="APP_ROUTES.FRONTEND.REGISTER"
    icon="pi pi-user-plus"
    :submit-label="APP_ROUTES.FRONTEND.REGISTER"
    :loading="isRegistering"
    :error="registerErrorMessage"
    footer-text="Already have an account?"
    footer-link-text="Sign in now"
    footer-route="/login"
    @submit="onSubmit"
  >
    <div class="field">
      <label for="nationality" class="block mb-2 font-medium"
        >Nationality</label
      >
      <Dropdown
        id="nationality"
        v-model="nationality"
        :options="NATIONALITY_OPTIONS"
        option-label="label"
        option-value="value"
        placeholder="Select nationality"
        class="w-full"
        :class="{ 'p-invalid': errors.nationality }"
      />
      <small class="p-error">{{ errors.nationality }}</small>
    </div>

    <div class="field">
      <label for="name" class="block mb-2 font-medium">Full Name</label>
      <InputText
        id="name"
        v-model="name"
        type="text"
        placeholder="Enter full name"
        class="w-full"
        :class="{ 'p-invalid': errors.name }"
      />
      <small class="p-error">{{ errors.name }}</small>
    </div>

    <div class="field">
      <label for="email" class="block mb-2 font-medium">Email</label>
      <InputText
        id="email"
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full"
        :class="{ 'p-invalid': errors.email }"
      />
      <small class="p-error">{{ errors.email }}</small>
    </div>

    <div class="field">
      <label for="password" class="block mb-2 font-medium">Password</label>
      <Password
        v-model="password"
        placeholder="Password"
        toggle-mask
        class="w-full"
        input-class="w-full"
        :class="{ 'p-invalid': errors.password }"
      >
        <template #footer>
          <Divider />
          <p class="mt-2 text-sm text-600">Safe Password Tips:</p>
          <ul class="pl-3 ml-2 mt-0 text-sm text-600" style="line-height: 1.5">
            <li>
              At least 8 characters, with uppercase, lowercase, and numbers
            </li>
            <li>Contains at least 1 special character (e.g., !@#$%)</li>
          </ul>
        </template>
      </Password>
      <small class="p-error">{{ errors.password }}</small>
    </div>

    <div class="field">
      <label for="confirmPassword" class="block mb-2 font-medium"
        >Confirm Password</label
      >
      <Password
        v-model="confirmPassword"
        placeholder="Confirm Password"
        :feedback="false"
        toggle-mask
        class="w-full"
        input-class="w-full"
        :class="{ 'p-invalid': errors.confirmPassword }"
      />
      <small class="p-error">{{ errors.confirmPassword }}</small>
    </div>
  </AuthLayout>
</template>
<script setup lang="ts">
import {
  APP_ROUTES,
  Nationality,
  NATIONALITY_OPTIONS,
  type RegisterDto,
  registerSchema,
} from "@intern/factory";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import { useRouter } from "vue-router";

import AuthLayout from "../components/AuthLayout.vue";
import { useMutation } from "../composables";
import { type ApiErrorResponse, authService } from "../services";
import { useLoadingStore } from "../stores/loadingStore";

const router = useRouter();
const loadingStore = useLoadingStore();
const {
  mutate: register,
  isLoading: isRegistering,
  error: registerError,
} = useMutation(authService.register);

const registerErrorMessage = computed(() => {
  const typedError = registerError.value as {
    response?: { data?: ApiErrorResponse };
  } | null;

  return typedError?.response?.data?.message || null;
});

watch(isRegistering, (value) => {
  if (value) loadingStore.startLoading();
  else loadingStore.stopLoading();
});

const { handleSubmit, errors, defineField } = useForm<RegisterDto>({
  validationSchema: registerSchema,
  initialValues: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationality: Nationality.US,
    balance: 0,
  },
});

const [nationality] = defineField("nationality");
const [name] = defineField("name");
const [email] = defineField("email");
const [password] = defineField("password");
const [confirmPassword] = defineField("confirmPassword");

const onSubmit = handleSubmit(async (values) => {
  await register(values);
  if (!registerError.value) router.push({ name: APP_ROUTES.FRONTEND.LOGIN });
});
</script>
