<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'

type Status = 'active' | 'inactive'
type Mode = 'create' | 'edit'

const props = defineProps<{
  open: boolean
  mode: Mode
  initialName?: string
  initialCnpj?: string
  initialStatus?: Status
  saving?: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { name: string; cnpj: string; status: Status }): void
}>()

const name = ref(props.initialName ?? '')
const cnpj = ref(props.initialCnpj ?? '')
const status = ref<Status>(props.initialStatus ?? 'active')

const touched = reactive({ name: false, cnpj: false })
const submitted = ref(false)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    name.value = props.initialName ?? ''
    cnpj.value = props.initialCnpj ?? ''
    status.value = props.initialStatus ?? 'active'
    touched.name = touched.cnpj = false
    submitted.value = false
  }
})

const title = computed(() => props.mode === 'create' ? 'Nova empresa' : 'Editar empresa')

const cnpjDigits = computed(() => (cnpj.value || '').replace(/\D/g, ''))
const nameError = computed(() => (name.value.trim() ? '' : 'Nome é obrigatório'))
const cnpjError = computed(() => (cnpjDigits.value.length === 14 ? '' : 'CNPJ deve ter 14 dígitos'))
const hasErrors = computed(() => !!nameError.value || !!cnpjError.value)

function markTouched(field: 'name' | 'cnpj') {
  touched[field] = true
}

function onSubmit() {
  submitted.value = true
  if (hasErrors.value) return
  emits('submit', {
    name: name.value.trim(),
    cnpj: cnpj.value.trim(),
    status: status.value
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
       role="dialog" aria-modal="true" @click.self="$emit('close')">
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold">{{ title }}</h4>
        <button type="button"
                class="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                @click="$emit('close')">
          Fechar
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome</label>
          <input v-model="name" type="text"
                 class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                 placeholder="Nome da empresa"
                 @input="markTouched('name')" @blur="markTouched('name')" />
          <p v-if="(touched.name || submitted) && nameError" class="mt-1 text-xs text-red-600">
            {{ nameError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">CNPJ</label>
          <input v-model="cnpj" type="text"
                 class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                 placeholder="00.000.000/0000-00"
                 @input="markTouched('cnpj')" @blur="markTouched('cnpj')" />
          <p v-if="(touched.cnpj || submitted) && cnpjError" class="mt-1 text-xs text-red-600">
            {{ cnpjError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <div class="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button type="button"
                    @click="status = 'active'"
                    :class="['px-4 py-2 text-sm transition-colors', status==='active' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100']">
              Ativa
            </button>
            <button type="button"
                    @click="status = 'inactive'"
                    :class="['px-4 py-2 text-sm transition-colors border-l border-gray-300', status==='inactive' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100']">
              Inativa
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2">
        <button type="button"
                class="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                :disabled="saving" @click="$emit('close')">
          Cancelar
        </button>
        <button type="button"
                class="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-black/90"
                :disabled="hasErrors || saving" @click="onSubmit">
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>
