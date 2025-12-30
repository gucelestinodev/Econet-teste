<script setup lang="ts">
import { ref } from 'vue'
import { deleteCompany } from '../../api/company.service'
import { deleteUser } from '../../api/user.service'

type TargetType = 'company' | 'user'

const props = defineProps<{
  open: boolean
  targetType: TargetType
  targetId: number
  title?: string
  message?: string
  confirmLabel?: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'success', payload: { targetType: TargetType; targetId: number }): void
}>()

const loading = ref(false)

async function onConfirm() {
  try {
    loading.value = true
    if (props.targetType === 'company') {
      await deleteCompany(props.targetId)
    } else {
      await deleteUser(props.targetId)
    }
    emits('success', { targetType: props.targetType, targetId: props.targetId })
  } catch (e: any) {
    alert(e?.message ?? 'Falha ao excluir')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <div class="mb-4">
        <h4 class="text-lg font-semibold">
          {{ title || 'Confirmar exclusão' }}
        </h4>
      </div>

      <p class="text-sm text-gray-700 mb-6">
        {{ message || 'Tem certeza que deseja excluir este item?' }}
      </p>

      <div class="flex items-center justify-end gap-2">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:border-black"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          @click="onConfirm"
          class="px-4 py-2 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 focus:outline-none focus:border-red-600"
          :disabled="loading"
        >
          {{ loading ? 'Excluindo…' : (confirmLabel || 'Excluir') }}
        </button>
      </div>
    </div>
  </div>
</template>
