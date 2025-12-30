<script setup lang="ts">
import { computed, ref, watch, reactive, nextTick } from "vue";

type Status = "active" | "inactive";
type Mode = "create" | "edit";

const props = defineProps<{
  open: boolean;
  mode: Mode;
  initialName?: string;
  initialCnpj?: string;
  initialStatus?: Status;
  saving?: boolean;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "submit", payload: { name: string; cnpj: string; status: Status }): void;
}>();

const name = ref(props.initialName ?? "");
const cnpj = ref(props.initialCnpj ?? "");
const status = ref<Status>(props.initialStatus ?? "active");

const touched = reactive({ name: false, cnpj: false });
const submitted = ref(false);

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function formatCnpjDigits(digits: string) {
  const d = (digits || "").slice(0, 14);

  if (d.length <= 2) return d;
  if (d.length <= 5) return d.replace(/^(\d{2})(\d+)/, "$1.$2");
  if (d.length <= 8) return d.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (d.length <= 12)
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");

  return d.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/,
    "$1.$2.$3/$4-$5"
  );
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      name.value = props.initialName ?? "";
      cnpj.value = formatCnpjDigits(onlyDigits(props.initialCnpj ?? ""));
      status.value = props.initialStatus ?? "active";
      touched.name = touched.cnpj = false;
      submitted.value = false;
    }
  }
);

function handleCnpjInput(e: Event) {
  const input = e.target as HTMLInputElement;

  const raw = input.value;
  const digits = onlyDigits(raw);

  const formatted = formatCnpjDigits(digits);
  cnpj.value = formatted;

  input.value = formatted;

  nextTick(() => {
    input.setSelectionRange(formatted.length, formatted.length);
  });

  markTouched("cnpj");
}

function handleCnpjKeydown(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement;

  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Escape",
    "Enter",
  ];
  if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;

  const isDigit = /^[0-9]$/.test(e.key);
  if (!isDigit) {
    e.preventDefault();
    return;
  }

  const digits = onlyDigits(input.value);
  const hasSelection = input.selectionStart !== input.selectionEnd;

  if (digits.length >= 14 && !hasSelection) {
    e.preventDefault();
  }
}

function handleCnpjPaste(e: ClipboardEvent) {
  const input = e.target as HTMLInputElement;
  const text = e.clipboardData?.getData("text") || "";
  const digits = onlyDigits(text);

  e.preventDefault();

  const formatted = formatCnpjDigits(digits);
  cnpj.value = formatted;
  input.value = formatted;

  nextTick(() => {
    input.setSelectionRange(formatted.length, formatted.length);
  });

  markTouched("cnpj");
}

const title = computed(() =>
  props.mode === "create" ? "Nova empresa" : "Editar empresa"
);

const cnpjDigits = computed(() => onlyDigits(cnpj.value));
const nameError = computed(() => (name.value.trim() ? "" : "Nome é obrigatório"));

const cnpjError = computed(() => {
  const d = cnpjDigits.value;
  if (!d.length) return "CNPJ é obrigatório";
  if (d.length !== 14) return "CNPJ deve ter 14 dígitos";
  return "";
});

const hasErrors = computed(() => !!nameError.value || !!cnpjError.value);

function markTouched(field: "name" | "cnpj") {
  touched[field] = true;
}

function onSubmit() {
  submitted.value = true;
  if (hasErrors.value) return;

  emits("submit", {
    name: name.value.trim(),
    cnpj: cnpj.value.trim(),
    status: status.value,
  });
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold">{{ title }}</h4>
        <button
          type="button"
          class="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 outline-none focus-visible:outline-none focus-visible:ring-0"
          @click="$emit('close')"
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
            class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-0 focus:border-black caret-black selection:bg-black selection:text-white"
            :class="[
              (touched.name || submitted) && nameError
                ? 'border-red-500'
                : 'border-gray-300',
            ]"
            placeholder="Nome da empresa"
            @input="markTouched('name')"
            @blur="markTouched('name')"
          />
          <p
            v-if="(touched.name || submitted) && nameError"
            class="mt-1 text-xs text-red-600"
          >
            {{ nameError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">CNPJ</label>
          <input
            :value="cnpj"
            @input="handleCnpjInput"
            @keydown="handleCnpjKeydown"
            @paste="handleCnpjPaste"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-0 focus:border-black caret-black selection:bg-black selection:text-white"
            :class="[
              (touched.cnpj || submitted) && cnpjError
                ? 'border-red-500'
                : 'border-gray-300',
            ]"
            placeholder="00.000.000/0000-00"
            @blur="markTouched('cnpj')"
          />
          <p
            v-if="(touched.cnpj || submitted) && cnpjError"
            class="mt-1 text-xs text-red-600"
          >
            {{ cnpjError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <div class="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button
              type="button"
              @click="status = 'active'"
              class="px-4 py-2 text-sm transition-colors outline-none focus-visible:outline-none focus-visible:ring-0"
              :class="status === 'active' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'"
            >
              Ativa
            </button>

            <button
              type="button"
              @click="status = 'inactive'"
              class="px-4 py-2 text-sm transition-colors border-l border-gray-300 outline-none focus-visible:outline-none focus-visible:ring-0"
              :class="status === 'inactive' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'"
            >
              Inativa
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 outline-none focus-visible:outline-none focus-visible:ring-0"
          :disabled="saving"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-black/90 outline-none focus-visible:outline-none focus-visible:ring-0"
          :disabled="hasErrors || saving"
          @click="onSubmit"
        >
          {{ saving ? "Salvando…" : "Salvar" }}
        </button>
      </div>
    </div>
  </div>
</template>
