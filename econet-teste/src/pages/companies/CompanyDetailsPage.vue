<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCompany, updateCompany, type Company } from '../../api/company.service'
import {
  listUsersByCompany,
  createUser,
  updateUser,
  deleteUser,
  type User
} from '../../api/user.service'
import { useToastStore } from '../../stores/toast.store'
import EditCompanyModal from '../../components/modals/EditCompanyModal.vue'
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.vue'
import UserModal from '../../components/modals/UserModal.vue'

const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)
const toast = useToastStore()

const loading = ref(true)
const error = ref<string | null>(null)
const company = ref<Company | null>(null)
const users = ref<User[]>([])

const showEdit = ref(false)
const saving = ref(false)
const showDeleteCompany = ref(false)

const showUserModal = ref(false)
const userSaving = ref(false)
const userMode = ref<'create' | 'edit'>('create')
const editingUserId = ref<number | null>(null)
const userInitialName = ref('')
const userInitialEmail = ref('')
const userInitialRole = ref('')

const showDeleteUser = ref(false)
const deletingUserId = ref<number | null>(null)
const deletingUserName = ref('')

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

function goBack() { router.back() }

function openEdit() {
  if (!company.value) return
  showEdit.value = true
}
function closeEdit() { showEdit.value = false }

async function submitEdit(payload: { name: string; cnpj: string; status: 'active' | 'inactive' }) {
  try {
    saving.value = true
    const updated = await updateCompany(id, payload)
    company.value = updated
    showEdit.value = false
    toast.success('Empresa atualizada com sucesso!')
  } catch (e: any) {
    toast.error(e?.message ?? 'Falha ao salvar alterações da empresa')
  } finally {
    saving.value = false
  }
}

function openDeleteCompany() { showDeleteCompany.value = true }
function closeDeleteCompany() { showDeleteCompany.value = false }
function onDeleteSuccessCompany() {
  toast.success('Empresa excluída com sucesso!')
  router.push('/companies')
}

function openAddUser() {
  userMode.value = 'create'
  editingUserId.value = null
  userInitialName.value = ''
  userInitialEmail.value = ''
  userInitialRole.value = ''
  showUserModal.value = true
}

function openEditUser(u: User) {
  userMode.value = 'edit'
  editingUserId.value = u.id ?? null
  userInitialName.value = u.name
  userInitialEmail.value = u.email
  userInitialRole.value = u.role
  showUserModal.value = true
}
function closeUserModal() { showUserModal.value = false }

async function submitUser(payload: { name: string; email: string; role: string }) {
  try {
    userSaving.value = true
    if (userMode.value === 'create') {
      const created = await createUser({ companyId: id, ...payload })
      users.value = [created, ...users.value]
      toast.success('Usuário criado com sucesso!')
    } else {
      const updated = await updateUser(editingUserId.value!, payload)
      users.value = users.value.map(u => (u.id === updated.id ? updated : u))
      toast.success('Usuário atualizado com sucesso!')
    }
    showUserModal.value = false
  } catch (e: any) {
    toast.error(e?.message ?? 'Falha ao salvar usuário')
  } finally {
    userSaving.value = false
  }
}

function openDeleteUser(u: User) {
  deletingUserId.value = u.id ?? null
  deletingUserName.value = u.name
  showDeleteUser.value = true
}
function closeDeleteUser() { showDeleteUser.value = false }

function onDeleteSuccessUser(e: { targetType: 'company' | 'user'; targetId: number }) {
  showDeleteUser.value = false
  if (e.targetType === 'user') {
    users.value = users.value.filter(u => u.id !== e.targetId)
    toast.success('Usuário excluído com sucesso!')
  }
}

const initialName = computed(() => company.value?.name ?? '')
const initialCnpj = computed(() => company.value?.cnpj ?? '')
const initialStatus = computed<'active' | 'inactive'>(() => company.value?.status ?? 'active')
const deleteMsgCompany = computed(() =>
  company.value ? `Tem certeza que deseja excluir a empresa "${company.value.name}"?` : 'Tem certeza?'
)
const deleteMsgUser = computed(() =>
  deletingUserName.value ? `Tem certeza que deseja excluir o usuário "${deletingUserName.value}"?` : 'Tem certeza?'
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
          <p>
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
              @click="openDeleteCompany"
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
        <button
          @click="openAddUser"
          class="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:border-black"
        >
          Adicionar usuário
        </button>
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
                <th class="py-2 w-40">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="border-b">
                <td class="py-2">{{ u.name }}</td>
                <td class="py-2">{{ u.email }}</td>
                <td class="py-2">{{ u.role }}</td>
                <td class="py-2">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditUser(u)"
                      class="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:border-black"
                    >
                      Editar
                    </button>
                    <button
                      @click="openDeleteUser(u)"
                      class="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50 focus:outline-none focus:border-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="4" class="py-4 text-center text-gray-500">Nenhum usuário</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <EditCompanyModal
      :open="showEdit"
      :initial-name="company?.name || ''"
      :initial-cnpj="company?.cnpj || ''"
      :initial-status="company?.status || 'active'"
      :saving="saving"
      @close="closeEdit"
      @submit="submitEdit"
    />

    <ConfirmDeleteModal
      :open="showDeleteCompany"
      target-type="company"
      :target-id="id"
      title="Excluir empresa"
      :message="deleteMsgCompany"
      confirm-label="Excluir"
      @close="closeDeleteCompany"
      @success="onDeleteSuccessCompany"
    />

    <UserModal
      :open="showUserModal"
      :mode="userMode"
      :initial-name="userInitialName"
      :initial-email="userInitialEmail"
      :initial-role="userInitialRole"
      :saving="userSaving"
      @close="closeUserModal"
      @submit="submitUser"
    />

    <ConfirmDeleteModal
      :open="showDeleteUser"
      target-type="user"
      :target-id="deletingUserId || 0"
      title="Excluir usuário"
      :message="deleteMsgUser"
      confirm-label="Excluir"
      @close="closeDeleteUser"
      @success="onDeleteSuccessUser"
    />
  </div>
</template>
