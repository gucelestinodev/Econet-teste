<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCompany, updateCompany, type Company } from '../../api/company.service'
import { listUsersByCompany, type User } from '../../api/user.service'

import EditCompanyModal from '../../components/modals/EditCompanyModal.vue'
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.vue'

const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)

const loading = ref(true)
const error = ref<string | null>(null)
const company = ref<Company | null>(null)
const users = ref<User[]>([])

const showEdit = ref(false)
const saving = ref(false)

const showDelete = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    company.value = await getCompany(id)
    users.value = await listUsersByCompany(id)
  } catch (e: any) {
    error.value = e?.message ?? 'Falha ao carregar detalhes.'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function openEdit() {
  if (!company.value) return
  showEdit.value = true
}

function openDelete() {
  showDelete.value = true
}

function closeEdit() {
  showEdit.value = false
}

function closeDelete() {
  showDelete.value = false
}

async function submitEdit(payload: { name: string; cnpj: string; status: 'active' | 'inactive' }) {
  if (!company.value) return
  try {
    saving.value = true
    const updated = await updateCompany(id, payload)
    company.value = updated
    showEdit.value = false
  } catch (e: any) {
    alert(e?.message ?? 'Falha ao salvar alterações')
  } finally {
    saving.value = false
  }
}

function onDeleteSuccess(e: { targetType: 'company' | 'user'; targetId: number }) {
  showDelete.value = false
  if (e.targetType === 'company') {
    router.push('/companies')
  }
}

const initialName = computed(() => company.value?.name ?? '')
const initialCnpj = computed(() => company.value?.cnpj ?? '')
const initialStatus = computed<'active' | 'inactive'>(() => company.value?.status ?? 'active')
const deleteMsg = computed(() =>
  company.value
    ? `Tem certeza que deseja excluir a empresa "${company.value.name}"?`
    : 'Tem certeza?'
)

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Detalhes da Empresa</h2>
        <button
          @click="goBack"
          class="px-4 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:border-black"
        >
          Voltar
        </button>
      </div>

      <div v-if="loading">Carregando…</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <div v-else-if="company" class="space-y-2">
        <p><strong>Nome:</strong> {{ company.name }}</p>
        <p><strong>CNPJ:</strong> {{ company.cnpj }}</p>

        <div class="flex items-center gap-3">
          <p class="mt-1">
            <strong>Status: </strong>
            <span
              :class="[
                'badge',
                company.status === 'active' ? 'badge-green' : 'badge-red',
              ]"
            >
              {{ company.status === "active" ? "Ativa" : "Inativa" }}
            </span>
          </p>

          <div class="ml-auto flex items-center gap-2">
            <button
              @click="openEdit"
              class="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:border-black"
            >
              Editar empresa
            </button>
            <button
              @click="openDelete"
              class="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:border-red-600"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Usuários vinculados</h3>
      </div>

      <div v-if="loading">Carregando…</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">Nome</th>
                <th class="py-2">E-mail</th>
                <th class="py-2">Cargo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="border-b">
                <td class="py-2">{{ u.name }}</td>
                <td class="py-2">{{ u.email }}</td>
                <td class="py-2">{{ u.role }}</td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="3" class="py-4 text-center text-gray-500">Nenhum usuário</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <EditCompanyModal
      :open="showEdit"
      :initial-name="initialName"
      :initial-cnpj="initialCnpj"
      :initial-status="initialStatus"
      :saving="saving"
      @close="closeEdit"
      @submit="submitEdit"
    />

    <ConfirmDeleteModal
      :open="showDelete"
      target-type="company"
      :target-id="id"
      title="Excluir empresa"
      :message="deleteMsg"
      confirm-label="Excluir"
      @close="closeDelete"
      @success="onDeleteSuccess"
    />
  </div>
</template>
