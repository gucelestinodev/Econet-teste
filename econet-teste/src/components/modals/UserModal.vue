<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

type Mode = "create" | "edit";

const props = defineProps<{
  open: boolean;
  mode: Mode;
  initialName?: string;
  initialEmail?: string;
  initialRole?: string;
  saving?: boolean;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "submit", payload: { name: string; email: string; role: string }): void;
}>();

const name = ref(props.initialName || "");
const email = ref(props.initialEmail || "");
const role = ref(props.initialRole || "");

const touched = reactive({ name: false, email: false, role: false });
const submitted = ref(false);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      name.value = props.initialName || "";
      email.value = props.initialEmail || "";
      role.value = props.initialRole || "";
      touched.name = touched.email = touched.role = false;
      submitted.value = false;
    }
  }
);

const title = computed(() =>
  props.mode === "create" ? "Adicionar usuário" : "Editar usuário"
);

const nameError = computed(() => (name.value.trim() ? "" : "Nome é obrigatório"));
const emailError = computed(() => {
  const v = email.value.trim();
  if (!v) return "E-mail é obrigatório";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "E-mail inválido";
});

const roleError = computed(() => (role.value.trim() ? "" : "Cargo é obrigatório"));
const hasErrors = computed(() => !!nameError.value || !!emailError.value || !!roleError.value);

function markTouched(field: keyof typeof touched) {
  touched[field] = true;
}

function onSubmit() {
  submitted.value = true;
  if (hasErrors.value) return;
  emits("submit", {
    name: name.value.trim(),
    email: email.value.trim(),
    role: role.value.trim(),
  });
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
      <div class="flex mb-4">
        <h4 class="text-lg font-semibold">{{ title }}</h4>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome</label>
          <input
            v-model="name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-0"
            placeholder="Nome completo"
            @input="markTouched('name')"
            @blur="markTouched('name')"
          />
          <p v-if="(touched.name || submitted) && nameError" class="mt-1 text-xs text-red-600">
            {{ nameError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">E-mail</label>
          <input
            v-model="email"
            type="email"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-0"
            placeholder="email@empresa.com"
            @input="markTouched('email')"
            @blur="markTouched('email')"
          />
          <p v-if="(touched.email || submitted) && emailError" class="mt-1 text-xs text-red-600">
            {{ emailError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Cargo</label>
          <input
            v-model="role"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-0"
            placeholder="Cargo do usuário"
            @input="markTouched('role')"
            @blur="markTouched('role')"
          />
          <p v-if="(touched.role || submitted) && roleError" class="mt-1 text-xs text-red-600">
            {{ roleError }}
          </p>
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
          :disabled="hasErrors || saving"
        >
          {{ saving ? "Salvando…" : "Salvar" }}
        </button>
      </div>
    </div>
  </div>
</template>
