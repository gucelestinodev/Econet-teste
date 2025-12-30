<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listCompanies, type Company } from '../../api/company.service'

const router = useRouter()

const companies = ref<Company[]>([])
const total = ref(0)
const limit = 10
const page = ref(1)
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')

let typingTimer: number | undefined
watch(search, () => {
  page.value = 1
  if (typingTimer) window.clearTimeout(typingTimer)
  typingTimer = window.setTimeout(() => {
    fetchCompanies()
  }, 300)
})

watch(page, () => {
  fetchCompanies()
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

async function fetchCompanies() {
  loading.value = true
  error.value = null
  try {
    const { data, total: t } = await listCompanies(page.value, limit, search.value || undefined)
    companies.value = data
    total.value = t
  } catch (e: any) {
    error.value = e?.message ?? 'Falha ao carregar empresas.'
  } finally {
    loading.value = false
  }
}

function goDetails(id: number) {
  console.log('indo p/ detalhes', id)
  router.push({ name: 'company-details', params: { id } })
}

function prev() {
  if (page.value > 1) page.value--
}
function next() {
  if (page.value < totalPages.value) page.value++
}

onMounted(fetchCompanies)
</script>

<template>
  <div class="bg-white rounded-2xl shadow p-6 border border-gray-100">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Empresas</h2>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nome ou CNPJ"
        class="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-black focus:ring-0 transition-colors"
      />
    </div>

    <div v-if="loading" class="py-10 text-center">Carregando…</div>
    <div v-else-if="error" class="py-10 text-center text-red-600">{{ error }}</div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2">Nome</th>
              <th class="py-2">CNPJ</th>
              <th class="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in companies"
              :key="c.id"
              class="border-b hover:bg-gray-50 cursor-pointer"
              @click="goDetails(c.id!)"
              title="Ver detalhes"
            >
              <td class="py-2">{{ c.name }}</td>
              <td class="py-2">{{ c.cnpj }}</td>
              <td class="py-2">
                <span
                  :class="['badge', c.status === 'active' ? 'badge-green' : 'badge-red']"
                >
                  {{ c.status === "active" ? "Ativa" : "Inativa" }}
                </span>
              </td>
            </tr>
            <tr v-if="!companies.length">
              <td colspan="3" class="py-6 text-center text-gray-500">
                Nenhuma empresa encontrada
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button class="btn btn-ghost" :disabled="page === 1" @click="prev">
          Anterior
        </button>
        <span class="text-sm">Página {{ page }} de {{ totalPages }}</span>
        <button class="btn btn-ghost" :disabled="page === totalPages" @click="next">
          Próxima
        </button>
      </div>
    </template>
  </div>
</template>
