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
          <span><strong>Notice:</strong> Editing the email may affect login information!</span>
        </div>
      </template>
    </UserDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '../stores/userStore';
  import { useNotifications } from '../composables/useNotifications';
  import { userAPI } from '../api/userAPI';
  import { SUCCESS_MESSAGES, Nationality } from '@intern/factory';
  import type { UserFromApi } from '@intern/factory';
  import type { ApiErrorResponse } from '../api/types';

  import UserTable from '../components/common/UserTable.vue';
  import UserDialog from '../components/UserDialog.vue';
  import Button from 'primevue/button';

  const { notifySuccess, notifyError } = useNotifications();
  const router = useRouter();
  const userStore = useUserStore();

  const showDialog = ref(false);
  const isEditMode = ref(false);
  const selectedUser = ref<{ id?: number; email: string; name: string; balance: number; nationality: Nationality }>({
    email: '',
    name: '',
    balance: 0,
    nationality: Nationality.US,
  });
  const isSaving = ref(false);

  const refreshCooldown = ref(0);
  const cooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

  const isRefreshDisabled = computed(() => {
    return userStore.loading || refreshCooldown.value > 0;
  });

  const refreshButtonLabel = computed(() => {
    if (refreshCooldown.value > 0) {
      return `Refresh (${refreshCooldown.value}s)`;
    }
    return 'Refresh';
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

    await userStore.fetchUsers();
    startCooldown();
  };

  const openEditDialog = (user: UserFromApi) => {
    isEditMode.value = true;
    selectedUser.value = { ...user, balance: Number(user.balance) };
    showDialog.value = true;
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Do you want to delete this user?')) return;
    const success = await userStore.deleteUser(id);
    if (success) notifySuccess(SUCCESS_MESSAGES.USER_DELETE);
    else notifyError('Delete failed');
  };

  const handleSaveUser = async (formData: { id: number; email: string; name: string; balance: number; nationality: Nationality }) => {
    isSaving.value = true;
    try {
      const { data } = await userAPI.updateUser(formData.id, formData);
      notifySuccess(data.message || SUCCESS_MESSAGES.USER_UPDATE);
      await userStore.fetchUsers();
      showDialog.value = false;
    } catch (error) {
      const typedError = error as { response?: { data?: ApiErrorResponse } };
      notifyError(typedError?.response?.data?.message || 'Save error');
    } finally {
      isSaving.value = false;
    }
  };

  onMounted(() => {
    userStore.fetchUsers();
  });

  onUnmounted(() => {
    if (cooldownTimer.value) {
      clearInterval(cooldownTimer.value);
    }
  });

  const goToUserProfile = (userId: string | number) => {
    router.push({ name: 'UserProfile', params: { id: userId } });
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
