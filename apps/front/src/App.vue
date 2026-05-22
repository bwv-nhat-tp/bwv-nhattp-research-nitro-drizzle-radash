<template>
  <div id="app">
    <router-view />
    <Toast />
    <LoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import Toast from "primevue/toast";
import { provide, reactive } from "vue";

import LoadingOverlay from "./components/common/LoadingOverlay.vue";
import { useApiClient } from "./composables";

const appConfig = reactive({
  locale: "en-US",
  currency: "USD",
});

provide("appConfig", appConfig);
useApiClient();
</script>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  background-color: #f8f9fa;
}
</style>
