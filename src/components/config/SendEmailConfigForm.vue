<template>
  <div class="config-form">
    <!-- Template Selection -->
    <div class="form-group">
      <label class="form-label">
        Template E-mail
        <span class="required">*</span>
      </label>

      <!-- Custom Dropdown -->
      <div class="custom-dropdown">
        <!-- Trigger Button -->
        <button
          type="button"
          class="dropdown-trigger"
          :class="{ 'is-open': showDropdown, 'has-error': !localConfig.template_id }"
          @click="showDropdown = !showDropdown"
        >
          <span v-if="!selectedTemplate" class="trigger-placeholder">Selecione um template...</span>
          <span v-else class="trigger-value">{{ selectedTemplate.nome }}</span>
          <svg class="trigger-icon" :class="{ 'rotated': showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <!-- Dropdown Panel -->
        <div v-if="showDropdown" class="dropdown-panel">
          <!-- Search -->
          <div class="dropdown-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              class="search-input"
              v-model="templateSearch"
              placeholder="Buscar template..."
            />
          </div>

          <!-- Options List -->
          <div class="dropdown-options">
            <div v-if="filteredTemplates.length === 0" class="dropdown-empty">
              Nenhum template encontrado
            </div>
            <button
              v-for="template in filteredTemplates"
              :key="template.id"
              type="button"
              class="dropdown-option"
              :class="{ 'is-selected': localConfig.template_id === template.id }"
              @click="selectTemplate(template)"
            >
              {{ template.nome }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Subject -->
    <div class="form-group">
      <label class="form-label">
        Assunto do E-mail
        <span class="required">*</span>
      </label>
      <input
        type="text"
        class="form-input"
        :class="{ error: !localConfig.assunto }"
        v-model="localConfig.assunto"
        placeholder="Ex: Novidades especiais para voce!"
        maxlength="200"
      />
      <span class="field-hint">Use ate 50 caracteres para melhor visualizacao em dispositivos moveis.</span>
    </div>

    <!-- Template Preview -->
    <div v-if="selectedTemplate" class="template-preview">
      <h4 class="preview-label">Preview</h4>
      <div class="preview-info">
        <div class="preview-field">
          <span class="preview-field-label">Template:</span>
          <span class="preview-field-value">{{ selectedTemplate.nome }}</span>
        </div>
        <div class="preview-field">
          <span class="preview-field-label">Assunto:</span>
          <span class="preview-field-value">{{ localConfig.assunto || '(não definido)' }}</span>
        </div>
      </div>
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

// Dropdown state
const showDropdown = ref(false)
const templateSearch = ref('')

const localConfig = ref({
  origem: 'template',
  template_id: '',
  template_nome: '',
  template_conteudo: '',
  assunto: '',
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
      assunto: newConfig.assunto || '',
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

// Filtered templates based on search
const filteredTemplates = computed(() => {
  if (!templateSearch.value.trim()) {
    return props.templates || []
  }
  const search = templateSearch.value.toLowerCase().trim()
  return (props.templates || []).filter(t =>
    t.nome?.toLowerCase().includes(search)
  )
})

// Selected template for preview
const selectedTemplate = computed(() => {
  if (localConfig.value.template_id) {
    return props.templates.find(t => t.id === localConfig.value.template_id)
  }
  return null
})

// Validation - requires both template and subject
const isValid = computed(() => {
  return !!localConfig.value.template_id && !!localConfig.value.assunto?.trim()
})

// Select template from dropdown
const selectTemplate = (template) => {
  localConfig.value.template_id = template.id
  localConfig.value.template_nome = template.nome || ''
  localConfig.value.template_conteudo = template.conteudo || ''
  showDropdown.value = false
  templateSearch.value = ''
}

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

/* Custom Dropdown */
.custom-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-trigger:hover {
  border-color: #9ca3af;
}

.dropdown-trigger.is-open {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.dropdown-trigger.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.trigger-placeholder {
  color: #9ca3af;
}

.trigger-value {
  color: #1A1A1A;
}

.trigger-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.trigger-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 280px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-search .search-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}

.dropdown-search .search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #1A1A1A;
  background: transparent;
}

.dropdown-search .search-input::placeholder {
  color: #9ca3af;
}

.dropdown-options {
  flex: 1;
  overflow-y: auto;
}

.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.dropdown-option {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s;
}

.dropdown-option:hover {
  background: #f9fafb;
}

.dropdown-option.is-selected {
  background: #f5f3ff;
  color: #7c3aed;
  font-weight: 500;
}

.dropdown-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

/* Form Input */
.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #1A1A1A;
  background: #ffffff;
  transition: all 0.15s ease;
}

.form-input:hover {
  border-color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.field-hint {
  font-size: 11px;
  color: #6b7280;
}

/* Template Preview */
.template-preview {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.preview-label {
  margin: 0 0 12px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-field {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
}

.preview-field-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 60px;
}

.preview-field-value {
  color: #1a1a1a;
  font-weight: 500;
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
