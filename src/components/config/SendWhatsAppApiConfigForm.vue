<template>
  <div class="config-form">
    <!-- Template Selection -->
    <div class="form-group">
      <label class="form-label">
        Template Meta
        <span class="required">*</span>
      </label>
      <select
        v-model="selectedTemplateName"
        class="form-select"
        :class="{ error: !selectedTemplateName }"
      >
        <option value="">Selecione um template...</option>
        <option
          v-for="template in approvedTemplates"
          :key="template.id"
          :value="template.name"
        >
          {{ template.name }}
        </option>
      </select>
    </div>

    <!-- Template Info Badges -->
    <div v-if="selectedTemplate" class="template-badges">
      <span class="badge" :class="categoryClass">{{ selectedTemplate.category }}</span>
      <span v-if="selectedTemplate.parameter_count > 0" class="badge badge-params">
        {{ selectedTemplate.parameter_count }} {{ selectedTemplate.parameter_count === 1 ? 'parametro' : 'parametros' }}
      </span>
    </div>

    <!-- Template Body Preview -->
    <div v-if="selectedTemplate" class="template-preview">
      <h4 class="preview-label">Preview do Template</h4>
      <div class="preview-content" v-html="highlightedBody"></div>
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

const selectedTemplateName = ref('')

// Filter only APPROVED templates
const approvedTemplates = computed(() => {
  return (props.templates || []).filter(t => t?.status === 'APPROVED')
})

// Selected template object
const selectedTemplate = computed(() => {
  if (!selectedTemplateName.value) return null
  return approvedTemplates.value.find(t => t.name === selectedTemplateName.value) || null
})

// Category badge class
const categoryClass = computed(() => {
  const cat = selectedTemplate.value?.category?.toLowerCase()
  if (cat === 'marketing') return 'badge-marketing'
  if (cat === 'utility') return 'badge-utility'
  if (cat === 'authentication') return 'badge-auth'
  return 'badge-default'
})

// Highlighted body text (replace {{N}} with styled spans)
const highlightedBody = computed(() => {
  if (!selectedTemplate.value?.body_text) return ''
  return selectedTemplate.value.body_text.replace(
    /\{\{(\d+)\}\}/g,
    '<span class="param-highlight">{{$1}}</span>'
  )
})

// Validation
const isValid = computed(() => {
  if (!selectedTemplateName.value) return false
  if (!selectedTemplate.value) return false
  return true
})

// Initialize from existing config
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    selectedTemplateName.value = newConfig.meta_template_name || ''
  }
}, { immediate: true, deep: true })

const handleUpdate = () => {
  const config = {
    meta_template_name: selectedTemplateName.value,
    meta_template_language: selectedTemplate.value?.language || 'pt_BR',
  }
  emit('update', config)
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
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.form-select.error {
  border-color: #ef4444;
  background: #fef2f2;
}

/* Template Badges */
.template-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-marketing {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.badge-utility {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.badge-auth {
  background: #fce7f3;
  color: #9d174d;
  border: 1px solid #f9a8d4;
}

.badge-default {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.badge-params {
  background: #f5f3ff;
  color: #5b21b6;
  border: 1px solid #c4b5fd;
}

/* Template Preview */
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
  line-height: 1.6;
  background: #fafafa;
  padding: 10px 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.param-highlight) {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 12px;
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
  background: #25D366;
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
  background: #1da851;
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
