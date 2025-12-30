<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastStore } from '../../stores/toast.store'

const toast = useToastStore()
const hovering = ref(false)
const items = computed(() => toast.items)
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-[8%] z-[9999] flex justify-center pointer-events-none"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <TransitionGroup
      name="toastlist"
      tag="div"
      class="flex flex-col gap-3 pointer-events-auto"
    >
      <div
        v-for="t in items"
        :key="t.id"
        class="px-6 py-3 rounded-xl shadow-lg border bg-white text-sm flex items-center gap-3 animate-fade"
        role="status"
        aria-live="polite"
      >
        <span
          :class="[
            'inline-block w-2.5 h-2.5 rounded-full',
            t.type === 'success' && 'bg-green-500',
            t.type === 'error' && 'bg-red-500',
            t.type === 'warning' && 'bg-yellow-500',
            t.type === 'info' && 'bg-blue-500',
          ]"
        />
        <span class="text-gray-800">{{ t.message }}</span>

        <button
          class="ml-3 px-2 py-1 text-xs text-gray-500 hover:text-black"
          @click="toast.dismiss(t.id)"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toastlist-enter-from   { opacity: 0; transform: translateY(10px); }
.toastlist-enter-active { transition: all 0.25s ease-out; }
.toastlist-leave-to     { opacity: 0; transform: translateY(-10px); }
.toastlist-leave-active { transition: all 0.25s ease-in; }

@keyframes fade {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade {
  animation: fade 0.2s ease-out;
}
</style>
