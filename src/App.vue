<script setup>
import { onMounted, ref } from 'vue';
import Maintenance from './views/pages/Maintenance.vue';

const isMaintenanceMode = ref(false);
const maintenanceMessage = ref('');

onMounted(async () => {
    try {
        const response = await fetch('/maintenance.json?t=' + Date.now());
        const data = await response.json();
        isMaintenanceMode.value = data.enabled;
        maintenanceMessage.value = data.message;
    } catch (e) {
        // If fetch fails, assume not in maintenance
    }
});
</script>

<template>
    <Maintenance v-if="isMaintenanceMode" :message="maintenanceMessage" />
    <router-view v-else />
</template>

<style scoped></style>
