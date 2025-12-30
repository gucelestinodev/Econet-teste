<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCompany, type Company } from '../../api/company.service'
import { listUsersByCompany, type User } from '../../api/user.service'

const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)

const loading = ref(true)
const error = ref<string | null>(null)
const company = ref<Company | null>(null)
const users = ref<User[]>([])

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

      <div v-else-if="company">
        <p><strong>Nome:</strong> {{ company.name }}</p>
        <p><strong>CNPJ:</strong> {{ company.cnpj }}</p>
        <p class="mt-1">
          <strong>Status: </strong>
          <span
            :class="['badge', company.status === 'active' ? 'badge-green' : 'badge-red']"
          >
            {{ company.status === "active" ? "Ativa" : "Inativa" }}
          </span>
        </p>
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
                <td colspan="3" class="py-4 text-center text-gray-500">
                  Nenhum usuário
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
