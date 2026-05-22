<template>
  <div class="app-root">
    <section class="list-section">
      <div class="header-row">
        <h2>Users ({{ userStore.totalUsers }})</h2>
        <Button
          :label="refreshButtonLabel"
          icon="pi pi-refresh"
          class="p-button-secondary"
          :loading="userStore.loading"
          :disabled="isRefreshDisabled"
          @click="handleRefresh"
        />
      </div>

      <UserTable
        :users="userStore.users"
        :loading="userStore.loading"
        @edit="openEditDialog"
        @delete="handleDeleteUser"
        @view="goToUserProfile"
      />
    </section>

    <UserDialog
      v-model:visible="showDialog"
      :is-edit="isEditMode"
      :initial-data="selectedUser"
      :loading="isSaving"
      @save="handleSaveUser"
    >
      <template #notice>
        <div class="custom-warning">
          <i class="pi pi-exclamation-triangle"></i>
          <span
            ><strong>Notice:</strong> Editing the email may affect login
            information!</span
          >
        </div>
      </template>
    </UserDialog>
  </div>
</template>

<script setup lang="ts">
import type { UserFromApi } from "@intern/factory";
import { Nationality, SUCCESS_MESSAGES } from "@intern/factory";
import Button from "primevue/button";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import UserTable from "../components/common/UserTable.vue";
import UserDialog from "../components/UserDialog.vue";
import { useLazyQuery, useMutation } from "../composables";
import { useNotifications } from "../composables/useNotifications";
import { type ApiErrorResponse, userService } from "../services";
import { useLoadingStore } from "../stores/loadingStore";
import { useUserStore } from "../stores/userStore";

const { notifySuccess, notifyError } = useNotifications();
const router = useRouter();
const userStore = useUserStore();
const loadingStore = useLoadingStore();

const showDialog = ref(false);
const isEditMode = ref(false);
const selectedUser = ref<{
  id?: number;
  email: string;
  name: string;
  balance: number;
  nationality: Nationality;
}>({
  email: "",
  name: "",
  balance: 0,
  nationality: Nationality.US,
});
const isSaving = ref(false);
const { mutate: updateUser, error: updateUserError } = useMutation(
  userService.updateUser,
);
const {
  result: usersResult,
  refetch: refetchUsers,
  error: usersError,
  isLoading: isFetchingUsers,
} = useLazyQuery(userService.getAllUsers);
const {
  mutate: deleteUser,
  error: deleteUserError,
  isLoading: isDeletingUser,
} = useMutation(userService.deleteUser);

let listLoading = false;
watch([isFetchingUsers, isDeletingUser], ([fetching, deleting]) => {
  const value = fetching || deleting;
  if (value === listLoading) return;
  listLoading = value;
  userStore.setLoading(value);
  if (value) loadingStore.startLoading();
  else loadingStore.stopLoading();
});

const refreshCooldown = ref(0);
const cooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

const isRefreshDisabled = computed(() => {
  return userStore.loading || refreshCooldown.value > 0;
});

const refreshButtonLabel = computed(() => {
  if (refreshCooldown.value > 0) {
    return `Refresh (${refreshCooldown.value}s)`;
  }
  return "Refresh";
});

const startCooldown = () => {
  refreshCooldown.value = 5;
  const timer = setInterval(() => {
    refreshCooldown.value--;
    if (refreshCooldown.value <= 0) {
      clearInterval(timer);
      cooldownTimer.value = null;
    }
  }, 1000);
  cooldownTimer.value = timer;
};

const handleRefresh = async () => {
  if (isRefreshDisabled.value) return;

  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value);
    cooldownTimer.value = null;
  }

  await loadUsers();
  startCooldown();
};

const loadUsers = async () => {
  await refetchUsers();
  if (!usersError.value && usersResult.data) {
    userStore.setUsers(usersResult.data);
  } else if (usersError.value) {
    const typedError = usersError.value as {
      response?: { data?: ApiErrorResponse };
    };
    notifyError(typedError?.response?.data?.message || "Load error");
  }
};

const openEditDialog = (user: UserFromApi) => {
  isEditMode.value = true;
  selectedUser.value = { ...user, balance: Number(user.balance) };
  showDialog.value = true;
};

const handleDeleteUser = async (id: number) => {
  if (!confirm("Do you want to delete this user?")) return;
  await deleteUser(id);
  if (!deleteUserError.value) {
    userStore.removeUser(id);
    notifySuccess(SUCCESS_MESSAGES.USER_DELETE);
  } else {
    notifyError("Delete failed");
  }
};

const handleSaveUser = async (formData: {
  id: number;
  email: string;
  name: string;
  balance: number;
  nationality: Nationality;
}) => {
  isSaving.value = true;
  const data = await updateUser(formData.id, formData);
  if (!updateUserError.value && data) {
    notifySuccess(data.message || SUCCESS_MESSAGES.USER_UPDATE);
    await loadUsers();
    showDialog.value = false;
  } else {
    const typedError = updateUserError.value as {
      response?: { data?: ApiErrorResponse };
    };
    notifyError(typedError?.response?.data?.message || "Save error");
  }
  isSaving.value = false;
};

onMounted(() => {
  loadUsers();
});

onUnmounted(() => {
  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value);
  }
});

const goToUserProfile = (userId: string | number) => {
  router.push({ name: "UserProfile", params: { id: userId } });
};
</script>

<style scoped>
.app-root {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.form-section,
.list-section,
.transfer-section {
  margin-bottom: 32px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}
h2 {
  margin-top: 0;
  color: #34495e;
}
.custom-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #ffeeba;
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
