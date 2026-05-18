  <template>
    <BaseTable
      title="Transaction History"
      :data="logs"
      :loading="loading"
      :rows="limit"
      :lazy="true"
      :total-records="totalRecords"
      :searchable="true"
      :initial-search="searchQuery" @page="onPage"
      @search="onSearch"
    >
      <template #filters>
        <Dropdown
          v-model="timeRange"
          :options="timeOptions"
          option-label="label"
          option-value="value"
          placeholder="Select Time Range"
          class="w-full md:w-14rem"
        />
      </template>

      <Column field="createdAt" header="Time">
        <template #body="{ data }">
          <span class="time-text" :title="formatFullDate(data.createdAt)">
            {{ formatRelativeTime(data.createdAt) }}
          </span>
        </template>
      </Column>

      <Column header="Transaction">
        <template #body="{ data }">
          <div class="transaction-info">
            <span :class="{ 'fw-bold text-primary': isTargetUser(data.sender.id) }">
              {{ data.sender.name }}
            </span>
            <i class="pi pi-arrow-right mx-2 text-gray"></i>
            <span :class="{ 'fw-bold text-primary': isTargetUser(data.receiver.id) }">
              {{ data.receiver.name }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="amount" header="Amount" align-frozen="right">
        <template #body="{ data }">
          <span :class="getAmountClass(data)">
            {{ getAmountPrefix(data) }}{{ formatCurrency(data.amount, appConfig) }}
          </span>
        </template>
      </Column>

      <template #empty>
        <div class="text-center p-3 text-gray">No transactions found.</div>
      </template>
    </BaseTable>
  </template>

  <script setup lang="ts">
    import { ref, onMounted, watch, inject } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import Dropdown from 'primevue/dropdown';
    import { useTimeFilter } from '../../composables/useTimeFilter';
    import type { DataTablePageEvent } from 'primevue/datatable';
    import BaseTable from './BaseTable.vue';
    import Column from 'primevue/column';
    import { transferAPI } from '../../api/transferAPI';
    import { TransferLogData, type AppConfig } from '@intern/factory';
    import { formatCurrency, formatFullDate, formatRelativeTime } from '../../utils/formatters';
    import { useLoadingStore } from '../../stores/loadingStore';

    const props = defineProps<{
      targetUserId?: number;
    }>();

    const route = useRoute();
    const router = useRouter();
    const appConfig = inject<AppConfig>('appConfig');
    const loadingStore = useLoadingStore();
    const isFirstLoad = ref(true);

    watch(
      () => props.targetUserId,
      () => {
        page.value = 1;
        fetchLogs();
      }
    );

    const searchQuery = ref((route.query.search as string) || '');
    const logs = ref<TransferLogData[]>([]);
    const loading = ref(false);
    const page = ref(1);
    const limit = ref(5);
    const totalRecords = ref(0);

    const { timeRange, timeOptions, dateFilters } = useTimeFilter();

    watch(() => loadingStore.shouldShowLoading, (newVal) => {
      loading.value = newVal;
    }, { immediate: true });

    onMounted(() => {
      const urlSearch = route.query.search as string;
      if (urlSearch) {
        searchQuery.value = urlSearch;
      }
    });

    watch(
      () => route.query.search,
      (newSearch) => {
        const query = newSearch ? String(newSearch) : '';
        if (searchQuery.value !== query) {
          searchQuery.value = query;
          page.value = 1;
          fetchLogs();
        }
      }
    );

    const fetchLogs = async () => {
      if (isFirstLoad.value) {
        loadingStore.startLoading();
      }
      loading.value = true;
      try {
        const { startDate, endDate } = dateFilters.value;
        const response = props.targetUserId
          ? await transferAPI.getUserLogs(
              props.targetUserId,
              page.value,
              limit.value,
              searchQuery.value,
              startDate,
              endDate
            )
          : await transferAPI.getAllLogs(
              page.value,
              limit.value,
              searchQuery.value,
              startDate,
              endDate
            );
        logs.value = response.data.data;
        totalRecords.value = response.data.total;
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        loading.value = false;
        if (isFirstLoad.value) {
          loadingStore.stopLoading();
          isFirstLoad.value = false; 
        }
      }
    };

    const onSearch = (keyword: string) => {
      const currentQuery = { ...route.query };
      if (keyword) {
        currentQuery.search = keyword;
      } else {
        delete currentQuery.search;
      }
      router.push({ query: currentQuery });
    };

    const onPage = (event: DataTablePageEvent) => {
      page.value = event.page + 1;
      limit.value = event.rows;
      fetchLogs();
    };

    onMounted(() => {
      fetchLogs();
    });

    watch(timeRange, () => {
      page.value = 1;
      fetchLogs();
    });


    const isTargetUser = (id: number) =>
      props.targetUserId && Number(props.targetUserId) === Number(id);

    const getAmountClass = (data: TransferLogData) => {
      if (!props.targetUserId) return 'text-neutral';
      if (Number(data.receiverId) === Number(props.targetUserId)) return 'text-success fw-bold';
      return 'text-danger fw-bold';
    };

    const getAmountPrefix = (data: TransferLogData) => {
      if (!props.targetUserId) return '';
      if (Number(data.receiverId) === Number(props.targetUserId)) return '+';
      return '-';
    };

    defineExpose({ fetchLogs });
  </script>

  <style scoped>
    .time-text {
      color: #64748b;
      font-size: 0.9rem;
      cursor: help;
      border-bottom: 1px dotted #cbd5e1;
    }
    .transaction-info {
      display: flex;
      align-items: center;
    }
    .mx-2 {
      margin: 0 0.5rem;
    }
    .text-success {
      color: #10b981;
    }
    .text-danger {
      color: #ef4444;
    }
    .text-neutral {
      color: #334155;
    }
    .fw-bold {
      font-weight: 600;
    }
    .text-primary {
      color: #3b82f6;
    }
  </style>
