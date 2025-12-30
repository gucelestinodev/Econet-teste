<script setup lang="ts">
import ToastHost from "./components/ui/ToastHost.vue";
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <header class="border-b bg-white">
      <div class="mx-auto max-w-6xl px-4 py-4">
        <h1 class="text-xl font-bold">Econet • Backoffice</h1>
      </div>
    </header>

    <div class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </div>
  </main>

  <ToastHost />
</template>

<style scoped></style>
