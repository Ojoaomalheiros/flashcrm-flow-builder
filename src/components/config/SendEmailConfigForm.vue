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
        ref="subjectInputRef"
        type="text"
        class="form-input"
        :class="{ error: !localConfig.assunto }"
        v-model="localConfig.assunto"
        placeholder="Ex: Novidades especiais para voce!"
        maxlength="200"
      />
      <div class="subject-variables-row" ref="subjectVariablesRef">
        <button
          type="button"
          class="subject-variables-btn"
          title="Inserir variavel dinamica"
          @click="showSubjectVariables = !showSubjectVariables"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="variables-label">Inserir variavel</span>
        </button>

        <!-- Variables Dropdown -->
        <div v-if="showSubjectVariables" class="subject-variables-dropdown">
          <template v-for="(variables, category) in groupedVariables" :key="category">
            <div class="var-dropdown-category">{{ category }}</div>
            <button
              v-for="variable in variables"
              :key="variable.value"
              type="button"
              class="var-dropdown-item"
              @click="insertSubjectVariable(variable)"
            >
              <span class="var-item-label">{{ variable.label }}</span>
              <span class="var-item-tag">{{ variable.value }}</span>
            </button>
          </template>
        </div>
      </div>
      <span class="field-hint">Use ate 50 caracteres para melhor visualizacao em dispositivos moveis.</span>
    </div>

    <!-- Template Preview -->
    <div v-if="selectedTemplate" class="template-preview">
      <h4 class="preview-label">Preview</h4>
      <!-- Email Header Info -->
      <div class="preview-header">
        <div class="preview-subject">
          {{ localConfig.assunto || 'Sem assunto' }}
        </div>
        <div class="preview-template-name">
          {{ selectedTemplate.nome }}
        </div>
      </div>
      <!-- Email Visual Preview -->
      <div class="email-preview-area">
        <div class="email-preview-container">
          <iframe
            :srcdoc="selectedTemplate.conteudo || '<p style=&quot;color:#999;text-align:center;padding:40px&quot;>Sem conteúdo</p>'"
            class="email-preview-iframe"
            frameborder="0"
            scrolling="no"
          ></iframe>
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  config: { type: Object, default: () => ({}) },
  templates: { type: Array, default: () => [] },
})

const emit = defineEmits(['update', 'close'])

// Refs
const subjectInputRef = ref(null)
const subjectVariablesRef = ref(null)

// Dropdown state
const showDropdown = ref(false)
const showSubjectVariables = ref(false)
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

// Dynamic Variables
const availableVariables = [
  // Cliente
  { value: '{{nome_cliente}}', label: 'Nome', category: 'Cliente' },
  { value: '{{sobrenome}}', label: 'Sobrenome', category: 'Cliente' },
  { value: '{{email}}', label: 'E-mail', category: 'Cliente' },
  { value: '{{telefone}}', label: 'Telefone', category: 'Cliente' },
  // Pedido
  { value: '{{numero_pedido}}', label: 'Numero do Pedido', category: 'Pedido' },
  { value: '{{valor_pedido}}', label: 'Valor do Pedido', category: 'Pedido' },
  // Cashback
  { value: '{{valor_cashback}}', label: 'Valor do Cashback', category: 'Cashback' },
  { value: '{{cupom}}', label: 'Codigo do Cupom', category: 'Cashback' },
  { value: '{{data_vencimento}}', label: 'Data de Vencimento', category: 'Cashback' },
  { value: '{{data_ativacao}}', label: 'Data de Ativacao', category: 'Cashback' },
  { value: '{{compra_minima}}', label: 'Compra Minima', category: 'Cashback' },
  { value: '{{desconto_max}}', label: 'Desconto Maximo', category: 'Cashback' },
]

const groupedVariables = computed(() => {
  const groups = {}
  availableVariables.forEach(v => {
    const cat = v.category || 'Outros'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(v)
  })
  return groups
})

const insertSubjectVariable = (variable) => {
  const input = subjectInputRef.value
  if (!input) return

  const start = input.selectionStart
  const end = input.selectionEnd
  const text = localConfig.value.assunto || ''
  const newText = text.substring(0, start) + variable.value + text.substring(end)

  localConfig.value.assunto = newText
  showSubjectVariables.value = false

  nextTick(() => {
    input.focus()
    const newPos = start + variable.value.length
    input.setSelectionRange(newPos, newPos)
  })
}

// Click outside to close dropdowns
const handleClickOutside = (event) => {
  if (showSubjectVariables.value && subjectVariablesRef.value && !subjectVariablesRef.value.contains(event.target)) {
    showSubjectVariables.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

/* Subject Variables */
.subject-variables-row {
  position: relative;
}

.subject-variables-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f9fafb;
  color: #6b7280;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.subject-variables-btn:hover {
  background: #f3f0ff;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.variables-label {
  font-weight: 500;
}

.subject-variables-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
  width: 280px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.var-dropdown-category {
  padding: 8px 12px 4px;
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.var-dropdown-category:not(:first-child) {
  border-top: 1px solid #f3f4f6;
  margin-top: 4px;
  padding-top: 10px;
}

.var-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.1s;
  text-align: left;
}

.var-dropdown-item:hover {
  background: #f5f3ff;
}

.var-item-label {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.var-item-tag {
  font-size: 10px;
  color: #7c3aed;
  background: #f5f3ff;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
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
  overflow: hidden;
}

.preview-label {
  margin: 0;
  padding: 12px 16px 0 16px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.preview-header {
  padding: 8px 16px 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.preview-subject {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-template-name {
  font-size: 11px;
  color: #9ca3af;
}

/* Email Visual Preview */
.email-preview-area {
  position: relative;
  height: 320px;
  overflow: hidden;
  background: #f8fafc;
}

.email-preview-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.email-preview-iframe {
  width: 200%;
  height: 200%;
  transform: scale(0.5);
  transform-origin: top left;
  pointer-events: none;
  background: white;
  border: none;
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
