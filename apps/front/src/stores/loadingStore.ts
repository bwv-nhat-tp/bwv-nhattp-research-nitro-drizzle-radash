import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LOADING_CONFIG } from '@intern/factory';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);
  const loadingStartTime = ref<number | null>(null);
  const minimumDisplayTime = LOADING_CONFIG.MINIMUM_DISPLAY_TIME;
  const pendingPromises = ref(0);
  const stopTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  const shouldShowLoading = computed(() => {
    if (!isLoading.value) return false;
    if (!loadingStartTime.value) return false;

    const elapsed = Date.now() - loadingStartTime.value;
    return elapsed < minimumDisplayTime || pendingPromises.value > 0;
  });

  const startLoading = () => {
    if (pendingPromises.value === 0) {
      if (stopTimeout.value) {
        clearTimeout(stopTimeout.value);
        stopTimeout.value = null;
      }
      loadingStartTime.value = Date.now();
    }
    pendingPromises.value++;
    isLoading.value = true;
  };

  const stopLoading = () => {
    if (pendingPromises.value > 0) {
      pendingPromises.value--;
    }

    if (pendingPromises.value === 0 && loadingStartTime.value) {
      const elapsed = Date.now() - loadingStartTime.value;
      const remainingTime = Math.max(0, minimumDisplayTime - elapsed);

      if (stopTimeout.value) {
        clearTimeout(stopTimeout.value);
      }

      stopTimeout.value = setTimeout(() => {
        if (pendingPromises.value === 0) {
          isLoading.value = false;
          loadingStartTime.value = null;
        }
        stopTimeout.value = null;
      }, remainingTime);
    }
  };

  const forceStopLoading = () => {
    if (stopTimeout.value) {
      clearTimeout(stopTimeout.value);
      stopTimeout.value = null;
    }
    isLoading.value = false;
    loadingStartTime.value = null;
    pendingPromises.value = 0;
  };

  return {
    isLoading,
    shouldShowLoading,
    startLoading,
    stopLoading,
    forceStopLoading,
  };
});
