import { ref, computed, type Ref } from 'vue';
import { isNumber } from 'radash';

export function useBalanceFilter<T extends { balance: number | string }>(dataList: Ref<T[]>) {
  const minBalance = ref<number | null>(null);
  const maxBalance = ref<number | null>(null);

  const filteredData = computed(() => {
    const min = minBalance.value;
    const max = maxBalance.value;

    if (!isNumber(min) && !isNumber(max)) return dataList.value;

    return dataList.value.filter(item => {
      const bal = Number(item.balance);
      
      const satisfiesMin = !isNumber(min) || bal >= min;
      const satisfiesMax = !isNumber(max) || bal <= max;

      return satisfiesMin && satisfiesMax;
    });
  });

  return { minBalance, maxBalance, filteredData };
}
