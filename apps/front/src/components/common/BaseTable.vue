<template>
  <div class="base-table-container">
    <div v-if="title || $slots['header-actions'] || searchable" class="table-header-section">
      <h3 v-if="title">{{ title }}</h3>

      <div class="header-actions">
        <div class="custom-filters">
          <slot name="filters"></slot>
        </div>

        <span v-if="searchable" class="p-input-icon-left search-box">
          <i class="pi pi-search" />
          <InputText v-model="searchValue" placeholder="Search..." @input="onSearch" />
        </span>

        <slot name="header-actions"></slot>
      </div>
    </div>

    <DataTable
      v-model:filters="filters"
      :value="data"
      :loading="loading"
      :paginator="true"
      :rows="rows"
      :lazy="lazy"
      :total-records="totalRecords"
      responsive-layout="scroll"
      class="p-datatable-sm"
      :table-style="{ 'table-layout': 'fixed', 'min-width': '100%' }"
      :global-filter-fields="globalFilterFields"
      @page="$emit('page', $event)"
    >
      <slot></slot>
      <template #empty>
        <slot name="empty">
          <div class="text-center p-3 text-gray">No data found.</div>
        </slot>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts" generic="T">
  import { ref, onBeforeUnmount, watch } from 'vue';
  import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
  import InputText from 'primevue/inputtext';
  import { FilterMatchMode } from 'primevue/api';
  import { debounce } from 'radash';

  const props = defineProps<{
    data: T[];
    loading: boolean;
    title?: string;
    rows?: number;
    lazy?: boolean;
    totalRecords?: number;
    searchable?: boolean;
    globalFilterFields?: string[];
    initialSearch?: string;
  }>();

  const searchValue = ref(props.initialSearch || '');
  
  watch(() => props.initialSearch, (newVal) => {
    searchValue.value = newVal || '';
  });

  const emit = defineEmits<{
    (e: 'page', event: DataTablePageEvent): void;
    (e: 'search', keyword: string): void;
  }>();

  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const debouncedSearch = debounce({ delay: 500 }, (keyword: string) => {
    emit('search', keyword);
    if (!props.lazy) {
      filters.value.global.value = keyword as any;
    }
  });

  const onSearch = (event: Event) => {
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
  };

  onBeforeUnmount(() => {
    debouncedSearch.cancel();
  });
</script>

<style scoped>
  .base-table-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-top: 24px;
  }

  .table-header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .custom-filters {
    display: flex;
    gap: 8px;
  }

  .search-box {
    margin-right: 12px;
  }

  h3 {
    margin: 0;
    color: #334155;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .text-center {
    text-align: center;
  }

  .p-3 {
    padding: 1rem;
  }

  .text-gray {
    color: #94a3b8;
  }

  :deep(.p-datatable table) {
    table-layout: fixed !important;
    width: 100% !important;
  }

  :deep(.p-datatable-tbody > tr > td),
  :deep(.p-datatable-thead > tr > th) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
