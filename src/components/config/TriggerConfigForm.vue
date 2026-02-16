<template>
  <div class="config-form">
    <!-- Trigger Type Selection -->
    <div class="form-group">
      <label class="form-label">
        Tipo de Gatilho
        <span class="required">*</span>
      </label>
      <select
        v-model="localConfig.trigger_tipo"
        class="form-select"
        :class="{ error: !localConfig.trigger_tipo }"
        @change="handleTriggerTypeChange"
      >
        <option value="">Selecione o tipo...</option>
        <option value="order_status_change">Mudanca de Status do Pedido</option>
        <option value="carrinho_abandonado">Carrinho Abandonado Criado</option>
      </select>
    </div>

    <!-- Status Selection (only for order_status_change) -->
    <div v-if="localConfig.trigger_tipo === 'order_status_change'" class="form-group">
      <label class="form-label">
        Disparar quando status for:
        <span class="required">*</span>
      </label>
      <select
        v-model="localConfig.status_to"
        class="form-select"
        :class="{ error: !localConfig.status_to }"
      >
        <option value="">Selecione um status...</option>
        <option
          v-for="status in statusOptions"
          :key="status.value"
          :value="status.value"
        >
          {{ status.label }}
        </option>
      </select>

      <!-- Status Description -->
      <p v-if="selectedStatusDescription" class="form-help">
        {{ selectedStatusDescription }}
      </p>
    </div>

    <!-- Info Box - Como funciona (order_status_change) -->
    <div v-if="localConfig.trigger_tipo === 'order_status_change' && localConfig.status_to" class="info-box">
      <div class="info-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="info-content">
        <strong>Como funciona:</strong>
        <p>
          Este fluxo sera disparado quando um pedido mudar para
          <strong>"{{ selectedStatusLabel }}"</strong>, vindo de qualquer outro status.
        </p>
      </div>
    </div>

    <!-- Info Box - Carrinho Abandonado -->
    <div v-if="localConfig.trigger_tipo === 'carrinho_abandonado'" class="info-box info-box-cart">
      <div class="info-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
      <div class="info-content">
        <strong>Como funciona:</strong>
        <p>
          Este fluxo sera disparado automaticamente quando um carrinho abandonado for capturado na loja.
          Nenhuma configuracao adicional e necessaria.
        </p>
      </div>
    </div>

    <!-- Advanced Settings -->
    <details class="advanced-settings">
      <summary class="advanced-summary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"></path>
        </svg>
        Configurações Avançadas
      </summary>

      <div class="advanced-content">
        <!-- Permitir Reentrada -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="localConfig.permitir_reentrada"
              @change="handleReentradaChange"
            />
            <span>Permitir que cliente entre novamente no fluxo</span>
          </label>
          <p class="form-help">
            Se ativado, o mesmo cliente pode entrar neste fluxo múltiplas vezes
          </p>
        </div>

        <!-- Intervalo de Reentrada (condicional) -->
        <div v-if="localConfig.permitir_reentrada" class="form-group">
          <label class="form-label">
            Intervalo mínimo entre entradas (dias)
            <span class="optional">(opcional)</span>
          </label>
          <input
            type="number"
            v-model.number="localConfig.intervalo_reentrada_dias"
            class="form-input"
            min="0"
            step="1"
            placeholder="Ex: 7"
          />
          <p class="form-help">
            Deixe vazio para permitir reentrada imediata. Ex: 7 = aguardar 7 dias antes de permitir nova entrada
          </p>
        </div>
      </div>
    </details>

    <!-- Preview -->
    <div v-if="localConfig.trigger_tipo" class="preview-box">
      <h4 class="preview-title">Preview do Gatilho</h4>
      <div class="preview-content">
        <div class="preview-row">
          <span class="preview-label">Tipo:</span>
          <span class="preview-value">{{ previewTipoText }}</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Dispara quando:</span>
          <span class="preview-value">{{ previewStatusText }}</span>
        </div>
        <div v-if="localConfig.permitir_reentrada" class="preview-row">
          <span class="preview-label">Reentrada:</span>
          <span class="preview-value">
            {{ localConfig.intervalo_reentrada_dias
              ? `Permitida apos ${localConfig.intervalo_reentrada_dias} dia(s)`
              : 'Permitida imediatamente'
            }}
          </span>
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
  statusOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update', 'close'])

const localConfig = ref({
  trigger_tipo: '',
  status_from: null,  // SEMPRE null, conforme guia tecnico
  status_to: '',
  permitir_reentrada: false,
  intervalo_reentrada_dias: null,
})

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = {
      trigger_tipo: newConfig.trigger_tipo || '',
      status_from: null,  // SEMPRE null
      status_to: newConfig.status_to || '',
      permitir_reentrada: newConfig.permitir_reentrada || false,
      intervalo_reentrada_dias: newConfig.intervalo_reentrada_dias ?? null,
    }
  }
}, { immediate: true, deep: true })

// Handle trigger type change
const handleTriggerTypeChange = () => {
  // Reset status fields when changing type
  localConfig.value.status_from = null
  localConfig.value.status_to = ''
}

// Selected status info
const selectedStatus = computed(() => {
  return props.statusOptions.find(s => s.value === localConfig.value.status_to)
})

const selectedStatusLabel = computed(() => {
  return selectedStatus.value?.label || 'Não definido'
})

const selectedStatusDescription = computed(() => {
  return selectedStatus.value?.description || ''
})

// Preview texts
const previewTipoText = computed(() => {
  if (localConfig.value.trigger_tipo === 'carrinho_abandonado') {
    return 'Carrinho Abandonado'
  }
  return 'Mudanca de Status do Pedido'
})

const previewStatusText = computed(() => {
  if (localConfig.value.trigger_tipo === 'carrinho_abandonado') {
    return 'Carrinho abandonado criado na loja'
  }
  if (!localConfig.value.status_to) {
    return 'Selecione um status'
  }
  return `Status = ${selectedStatusLabel.value}`
})

// Handle reentrada change
const handleReentradaChange = () => {
  // Se desativar reentrada, limpar intervalo
  if (!localConfig.value.permitir_reentrada) {
    localConfig.value.intervalo_reentrada_dias = null
  } else {
    // Se ativar, definir valor padrão de 0 (imediato)
    localConfig.value.intervalo_reentrada_dias = 0
  }
}

// Validation
const isValid = computed(() => {
  if (!localConfig.value.trigger_tipo) return false
  if (localConfig.value.trigger_tipo === 'order_status_change') {
    return !!localConfig.value.status_to
  }
  // carrinho_abandonado is valid without extra config
  return true
})

const handleUpdate = () => {
  const config = {
    trigger_tipo: localConfig.value.trigger_tipo,
    status_from: null,
    status_to: localConfig.value.trigger_tipo === 'order_status_change'
      ? localConfig.value.status_to
      : '',
    permitir_reentrada: localConfig.value.permitir_reentrada,
    intervalo_reentrada_dias: localConfig.value.permitir_reentrada
      ? (localConfig.value.intervalo_reentrada_dias ?? 0)
      : null
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

.form-label .optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 11px;
  margin-left: 4px;
}

.form-help {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.form-select,
.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #1A1A1A;
  background: #ffffff;
  transition: all 0.15s ease;
}

.form-select {
  cursor: pointer;
}

.form-select:hover,
.form-input:hover {
  border-color: #9ca3af;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-select.error {
  border-color: #ef4444;
  background: #fef2f2;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
}

.info-icon {
  flex-shrink: 0;
  color: #3b82f6;
  margin-top: 2px;
}

.info-content {
  flex: 1;
  color: #1e40af;
}

.info-content strong {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.info-content p {
  margin: 0;
  color: #1e3a8a;
}

.info-box-cart {
  background: #fefce8;
  border-color: #fde68a;
}

.info-box-cart .info-icon {
  color: #d97706;
}

.info-box-cart .info-content {
  color: #92400e;
}

.info-box-cart .info-content p {
  color: #78350f;
}

/* Advanced Settings */
.advanced-settings {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.advanced-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  user-select: none;
  list-style: none;
  transition: background 0.15s ease;
}

.advanced-summary::-webkit-details-marker {
  display: none;
}

.advanced-summary svg {
  color: #6b7280;
  flex-shrink: 0;
}

.advanced-summary:hover {
  background: #f3f4f6;
}

.advanced-content {
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #7c3aed;
  cursor: pointer;
}

/* Preview Box */
.preview-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-top: 8px;
}

.preview-title {
  margin: 0 0 12px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}

.preview-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 100px;
}

.preview-value {
  color: #374151;
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
