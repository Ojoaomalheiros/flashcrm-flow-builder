<template>
  <div class="config-form">
    <!-- Template Selection -->
    <div class="form-group">
      <label class="form-label">
        Template WhatsApp
        <span class="required">*</span>
      </label>
      <select
        v-model="localConfig.template_id"
        class="form-select"
        :class="{ error: !localConfig.template_id }"
      >
        <option value="">Selecione um template...</option>
        <option
          v-for="template in templates"
          :key="template.id"
          :value="template.id"
        >
          {{ template.nome }}
        </option>
      </select>
    </div>

    <!-- Template Preview -->
    <div v-if="selectedTemplate" class="template-preview">
      <h4 class="preview-label">Preview</h4>
      <div class="preview-content">{{ selectedTemplate.conteudo }}</div>
    </div>

    <!-- Save Button -->
    <div class="form-actions">
      <button
        class="btn-cancel"
        @click="emit('close')"
      >
        Cancelar
      </button>
      <button
        class="btn-save"
        :disabled="!isValid"
        @click="handleUpdate"
      >
        Salvar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  config: { type: Object, default: () => ({}) },
  templates: { type: Array, default: () => [] },
})

const emit = defineEmits(['update', 'close'])

const localConfig = ref({
  origem: 'template',
  template_id: '',
  template_nome: '',
  template_conteudo: '',
  variaveis: {},
})

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = {
      origem: 'template',
      template_id: newConfig.template_id || '',
      template_nome: newConfig.template_nome || '',
      template_conteudo: newConfig.template_conteudo || '',
      variaveis: newConfig.variaveis || {},
    }
  }
}, { immediate: true, deep: true })

// Update template name and content when selection changes
watch(() => localConfig.value.template_id, (newId) => {
  if (newId) {
    const template = props.templates.find(t => t.id === newId)
    if (template) {
      localConfig.value.template_nome = template.nome || ''
      localConfig.value.template_conteudo = template.conteudo || ''
    }
  } else {
    localConfig.value.template_nome = ''
    localConfig.value.template_conteudo = ''
  }
})

// Selected template for preview
const selectedTemplate = computed(() => {
  if (localConfig.value.template_id) {
    return props.templates.find(t => t.id === localConfig.value.template_id)
  }
  return null
})

// Validation
const isValid = computed(() => {
  return !!localConfig.value.template_id
})

const handleUpdate = () => {
  emit('update', { ...localConfig.value })
  emit('close')
}
</script>

<style scoped>
.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-label .required {
  color: #dc2626;
  margin-left: 2px;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #1A1A1A;
  background: #ffffff;
  transition: all 0.15s ease;
  cursor: pointer;
}

.form-select:hover {
  border-color: #9ca3af;
}

.form-select:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-select.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.template-preview {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.preview-label {
  margin: 0 0 10px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.preview-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  background: #fafafa;
  padding: 10px 12px;
  border-radius: 4px;
}

/* Form Actions */
.form-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  background: #7c3aed;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #6d28d9;
}

.btn-save:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ffffff;
  color: #374151;
  padding: 9px 19px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 12px;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
</style>
