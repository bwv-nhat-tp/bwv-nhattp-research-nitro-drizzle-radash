import { UserFromApi } from "@intern/factory";
import { defineStore } from "pinia";
import { sum } from "radash";
import { computed, ref } from "vue";

export const useUserStore = defineStore("users", () => {
  const users = ref<UserFromApi[]>([]);
  const loading = ref(false);

  const totalUsers = computed(() => users.value.length);
  const totalBalance = computed(() =>
    sum(users.value, (u) => Number(u.balance)),
  );

  const setUsers = (value: UserFromApi[]) => {
    users.value = value;
  };

  const removeUser = (id: number) => {
    users.value = users.value.filter((u: UserFromApi) => u.id !== id);
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  return {
    users,
    loading,
    totalUsers,
    totalBalance,
    removeUser,
    setLoading,
    setUsers,
  };
});
