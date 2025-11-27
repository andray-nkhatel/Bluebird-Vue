<script setup>
defineProps({
    message: {
        type: String,
        default: "We're currently performing scheduled maintenance. Please check back soon."
    }
});
</script>

<template>
    <div class="maintenance-page">
        <div class="maintenance-content">
            <i class="pi pi-wrench maintenance-icon"></i>
            <h1>Under Maintenance</h1>
            <p>{{ message }}</p>
        </div>
    </div>
</template>

<style scoped>
.maintenance-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%);
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
}

.maintenance-content {
    text-align: center;
    padding: 2rem;
}

.maintenance-icon {
    font-size: 4rem;
    color: #64b5f6;
    margin-bottom: 1.5rem;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

p {
    font-size: 1.1rem;
    opacity: 0.85;
    max-width: 400px;
    line-height: 1.6;
}
</style>

