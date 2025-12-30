<script setup lang="ts">
import { computed, watch, ref } from 'vue'

type Status = 'active' | 'inactive'

const props = defineProps<{
  open: boolean
  initialName: string
  initialCnpj: string
  initialStatus: Status
  saving?: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { name: string; cnpj: string; status: Status }): void
}>()

const name = ref(props.initialName)
const cnpj = ref(props.initialCnpj)
const status = ref<Status>(props.initialStatus)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      name.value = props.initialName
      cnpj.value = props.initialCnpj
      status.value = props.initialStatus
    }
  }
)

const nameError = computed(() => (name.value.trim() ? '' : 'Nome é obrigatório'))
const cnpjDigits = computed(() => (cnpj.value || '').replace(/\D/g, ''))
const cnpjError = computed(() => (cnpjDigits.value.length === 14 ? '' : 'CNPJ deve ter 14 dígitos'))

function onSubmit() {
  if (nameError.value || cnpjError.value) return
  emits('submit', {
    name: name.value.trim(),
    cnpj: cnpj.value.trim(),
    status: status.value,
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold">Editar empresa</h4>
        <button
          @click="$emit('close')"
          class="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:border-black"
        >
          Fechar
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome</label>
          <input
            v-model="name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-0"
            placeholder="Nome da empresa"
          />
          <p v-if="nameError" class="mt-1 text-xs text-red-600">{{ nameError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">CNPJ</label>
          <input
            v-model="cnpj"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-0"
            placeholder="00.000.000/0000-00"
          />
          <p v-if="cnpjError" class="mt-1 text-xs text-red-600">{{ cnpjError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <div class="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button
              type="button"
              @click="status = 'active'"
              :class="[
                'px-4 py-2 text-sm transition-colors',
                status === 'active' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
              ]"
            >
              Ativa
            </button>
            <button
              type="button"
              @click="status = 'inactive'"
              :class="[
                'px-4 py-2 text-sm transition-colors border-l border-gray-300',
                status === 'inactive' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
              ]"
            >
              Inativa
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:border-black"
          :disabled="saving"
        >
          Cancelar
        </button>
        <button
          @click="onSubmit"
          class="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-black/90 focus:outline-none"
          :disabled="!!nameError || !!cnpjError || saving"
        >
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
