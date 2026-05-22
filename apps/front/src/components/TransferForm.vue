<template>
  <section v-if="users.length >= 2" class="transfer-section">
    <h2>Transfer Balance</h2>
    <div class="p-fluid p-formgrid p-grid">
      <div class="p-field p-col-12 p-md-6">
        <label>To</label>
        <Dropdown
          v-model="toUserId"
          :options="userOptions"
          option-label="label"
          option-value="value"
          :class="{ 'p-invalid': errors.toUserId }"
          placeholder="Select Receiver"
          filter
        />
        <small class="p-error">{{ errors.toUserId }}</small>
      </div>

      <div class="p-field p-col-12 p-md-6">
        <label>Amount</label>
        <InputNumber
          v-model="amount"
          :class="{ 'p-invalid': errors.amount }"
          mode="decimal"
          :min="0"
          placeholder="0.00"
        />
        <small class="p-error">{{ errors.amount }}</small>
      </div>
    </div>

    <div class="p-mt-2">
      <Button
        label="Send Money"
        icon="pi pi-send"
        class="p-button-success"
        :loading="loading"
        :disabled="!meta.valid"
        @click="onTransfer"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { baseTransferSchema, type TransferData } from "@intern/factory";
import { UserFromApi } from "@intern/factory";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import { select } from "radash";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";

import { useMutation } from "../composables";
import { useNotifications } from "../composables/useNotifications";
import { type ApiErrorResponse, transferService } from "../services";
import { useLoadingStore } from "../stores/loadingStore";

const props = defineProps<{ users: UserFromApi[]; currentUserId: number }>();
const emit = defineEmits(["success"]);
const { notifySuccess, notifyError } = useNotifications();
const loadingStore = useLoadingStore();
const {
  mutate: transferBalance,
  isLoading: loading,
  error: transferError,
} = useMutation(transferService.transferBalance);

watch(loading, (value) => {
  if (value) loadingStore.startLoading();
  else loadingStore.stopLoading();
});

const userOptions = computed(() =>
  select(
    props.users,
    (u) => ({
      label: `${u.name} ($${Number(u.balance).toFixed(2)})`,
      value: u.id,
    }),
    (u) => u.id !== props.currentUserId,
  ),
);

const { errors, handleSubmit, defineField, resetForm, meta } =
  useForm<TransferData>({
    validationSchema: baseTransferSchema,
    initialValues: { toUserId: undefined, amount: undefined },
  });

const [toUserId] = defineField("toUserId");
const [amount] = defineField("amount");

const onTransfer = handleSubmit(async (values) => {
  const data = await transferBalance(values);
  if (!transferError.value && data) {
    notifySuccess(data.message);
    resetForm();
    emit("success");
  } else {
    const typedError = transferError.value as {
      response?: { data?: ApiErrorResponse };
    };
    notifyError(typedError?.response?.data?.message || "Transfer error");
  }
});
</script>

<style scoped>
.p-mt-2 {
  margin-top: 1rem;
}
</style>
