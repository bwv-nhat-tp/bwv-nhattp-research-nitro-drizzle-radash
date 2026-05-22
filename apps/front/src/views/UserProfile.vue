<template>
  <div class="user-profile-page">
    <div class="header-action">
      <Button
        icon="pi pi-arrow-left"
        label="Back to Users"
        class="p-button-text"
        @click="goBack"
      />
    </div>

    <h1 class="page-title">User Profile</h1>

    <div v-if="loading" class="loading-state">Loading user details...</div>

    <div
      v-else-if="user"
      class="profile-layout"
      :class="{ 'single-column': !isMyProfile }"
    >
      <div v-if="isMyProfile" class="transfer-section">
        <h3>Transfer Money</h3>
        <p class="subtitle">Quickly transfer money from your wallet</p>

        <div class="transfer-wrapper">
          <TransferForm
            :users="userStore.users"
            :current-user-id="authStore.currentUser?.id || 0"
            @success="handleTransferSuccess"
          />
        </div>
      </div>

      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-frame">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="`${user.name} avatar`"
              class="avatar-image"
            />
            <i v-else class="pi pi-user avatar-fallback"></i>
          </div>

          <div v-if="isMyProfile" class="avatar-actions">
            <input
              ref="avatarInput"
              class="avatar-input"
              type="file"
              accept="image/jpeg"
              @change="handleAvatarSelect"
            />
            <Button
              icon="pi pi-upload"
              label="Upload Avatar"
              :loading="uploadingAvatar"
              :disabled="uploadingAvatar"
              @click="openAvatarPicker"
            />
            <small class="avatar-note">JPG only, max 2MB.</small>
          </div>
        </div>

        <div class="info-grid">
          <div
            v-for="item in profileDetails"
            :key="item.label"
            class="info-item"
          >
            <span class="label">{{ item.label }}:</span>
            <span class="value" :class="{ 'highlight-text': item.isHighlight }">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="user" class="logs-section mt-4">
      <TransferLogs ref="logsRef" :target-user-id="user.id" />
    </div>

    <div v-else class="error-state">User not found.</div>
  </div>
</template>

<script setup lang="ts">
import type { AppConfig, UserFromApi } from "@intern/factory";
import Button from "primevue/button";
import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TransferLogs from "../components/common/TransferLogs.vue";
import TransferForm from "../components/TransferForm.vue";
import { useLazyQuery, useMutation } from "../composables";
import { useNotifications } from "../composables/useNotifications";
import { type ApiErrorResponse, authService, userService } from "../services";
import { useAuthStore } from "../stores/authStore";
import { useLoadingStore } from "../stores/loadingStore";
import { useUserStore } from "../stores/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const { notifySuccess, notifyError } = useNotifications();

const user = ref<UserFromApi | null>(null);
const loading = ref(true);
const uploadingAvatar = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const {
  result: userResult,
  refetch: refetchUser,
  error: userError,
} = useLazyQuery(userService.getUserById);
const {
  result: avatarResult,
  mutate: uploadAvatar,
  error: uploadAvatarError,
} = useMutation(userService.uploadAvatar);
const {
  result: usersResult,
  refetch: refetchUsers,
  error: usersError,
} = useLazyQuery(userService.getAllUsers);
const {
  result: meResult,
  refetch: refetchMe,
  error: meError,
} = useLazyQuery(authService.getMe);

const appConfig = inject<AppConfig>("appConfig");

const formattedBalance = computed(() => {
  if (!user.value || !appConfig) return "";
  const currency = appConfig.locale === "ja-JP" ? "JPY" : "USD";
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency,
  }).format(Number(user.value.balance));
});

const profileDetails = computed(() => {
  if (!user.value) return [];
  return [
    { label: "ID", value: user.value.id },
    { label: "Name", value: user.value.name },
    { label: "Email", value: user.value.email },
    { label: "Nationality", value: user.value.nationality },
    { label: "Balance", value: formattedBalance.value, isHighlight: true },
  ];
});

const avatarUrl = computed(() => {
  if (!user.value?.avatarUrl) return "";
  const separator = user.value.avatarUrl.includes("?") ? "&" : "?";
  return `${user.value.avatarUrl}${separator}v=${encodeURIComponent(user.value.updatedAt)}`;
});

const goBack = () => router.push("/users");

const fetchUserDetails = async () => {
  loading.value = true;
  loadingStore.startLoading();
  await refetchUser(Number(route.params.id));
  if (!userError.value) {
    user.value = userResult.data;
  } else {
    console.error("Failed to fetch user details", userError.value);
  }
  loading.value = false;
  loadingStore.stopLoading();
};

const loadUsers = async () => {
  await refetchUsers();
  if (!usersError.value && usersResult.data) {
    userStore.setUsers(usersResult.data);
  }
};

const refreshCurrentUser = async () => {
  await refetchMe();
  if (!meError.value) {
    authStore.setCurrentUser(meResult.data);
  }
};

const isMyProfile = computed(() => {
  if (!authStore.currentUser || !user.value) return false;
  return Number(authStore.currentUser.id) === Number(user.value.id);
});

const logsRef = ref<InstanceType<typeof TransferLogs> | null>(null);

const openAvatarPicker = () => {
  avatarInput.value?.click();
};

const handleAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file || !user.value) return;

  if (file.size > 2 * 1024 * 1024) {
    notifyError("Avatar image must not exceed 2MB");
    return;
  }

  if (file.type !== "image/jpeg") {
    notifyError("Avatar image must be a JPG file");
    return;
  }

  uploadingAvatar.value = true;
  loadingStore.startLoading();
  await uploadAvatar(user.value.id, file);
  if (!uploadAvatarError.value && avatarResult.value) {
    user.value = avatarResult.value;
    await Promise.all([loadUsers(), refreshCurrentUser()]);
    notifySuccess("Avatar uploaded");
  } else {
    const typedError = uploadAvatarError.value as {
      response?: { data?: ApiErrorResponse };
    };
    notifyError(typedError?.response?.data?.message || "Upload avatar failed");
  }
  uploadingAvatar.value = false;
  loadingStore.stopLoading();
};

const handleTransferSuccess = async () => {
  await Promise.all([loadUsers(), fetchUserDetails()]);
  if (logsRef.value) {
    logsRef.value.fetchLogs();
  }
};

onMounted(() => {
  fetchUserDetails();
});

watch(
  isMyProfile,
  (canTransfer) => {
    if (canTransfer && userStore.users.length === 0 && !userStore.loading) {
      loadUsers();
    }
  },
  { immediate: true },
);

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchUserDetails();
    }
  },
  { immediate: false },
);
</script>

<style scoped>
.user-profile-page {
  padding: 24px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
.header-action {
  margin-bottom: 20px;
}
.page-title {
  margin: 0 0 24px;
  text-align: center;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 700;
}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.profile-layout.single-column {
  grid-template-columns: minmax(auto, 600px);
  justify-content: center;
}
.mt-4 {
  margin-top: 2rem;
}
.profile-card,
.transfer-section {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.transfer-section {
  border-top: 4px solid #3b82f6;
}
.subtitle {
  color: #64748b;
  margin-top: -10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.avatar-frame {
  width: 144px;
  height: 144px;
  border-radius: 50%;
  border: 3px solid #dbeafe;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-fallback {
  color: #94a3b8;
  font-size: 4rem;
}
.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.avatar-input {
  display: none;
}
.avatar-note {
  color: #64748b;
  font-size: 0.82rem;
}
.info-grid {
  display: grid;
  gap: 16px;
  margin-top: 28px;
}
.info-item {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
.label {
  font-weight: 600;
  color: #64748b;
  width: 120px;
}
.value {
  color: #334155;
}
.highlight-text {
  font-weight: bold;
  color: #10b981;
  font-size: 1.1rem;
}

@media (max-width: 992px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  .profile-card {
    order: 1;
  }
  .transfer-section {
    order: 2;
  }
}
</style>
