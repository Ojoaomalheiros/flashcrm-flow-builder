<template>
  <div class="config-form">
    <!-- Definir tempo de espera -->
    <div class="form-group">
      <label class="form-label">Definir tempo de espera</label>
      <div class="delay-input-group">
        <input
          type="number"
          v-model.number="localConfig.valor"
          class="form-input delay-value"
          min="1"
          :max="maxValue"
        />
        <select
          v-model="localConfig.tipo"
          class="form-select delay-unit"
        >
          <option value="minutes">Minutos</option>
          <option value="hours">Horas</option>
          <option value="days">Dias</option>
          <option value="weeks">Semanas</option>
          <option value="months">Meses</option>
        </select>
      </div>
    </div>

    <!-- Visualização -->
    <div class="preview-box">
      <h4 class="preview-title">Visualização</h4>
      <div class="preview-content">
        <p class="preview-main">{{ previewMainText }}</p>
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
})

const emit = defineEmits(['update', 'close'])

const localConfig = ref({
  tipo: '',
  valor: null,
})

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = {
      tipo: newConfig.tipo || '',
      valor: newConfig.valor ?? null,
    }
  }
}, { immediate: true, deep: true })

const maxValue = computed(() => {
  switch (localConfig.value.tipo) {
    case 'minutes': return 1440 // 24 hours
    case 'hours': return 168   // 7 days
    case 'days': return 365
    case 'weeks': return 52
    case 'months': return 12
    default: return 365
  }
})

const previewMainText = computed(() => {
  if (!localConfig.value.valor || !localConfig.value.tipo) {
    return 'Nenhuma configuração'
  }

  const unitMap = {
    'minutes': localConfig.value.valor === 1 ? 'minuto' : 'minutos',
    'hours': localConfig.value.valor === 1 ? 'hora' : 'horas',
    'days': localConfig.value.valor === 1 ? 'dia' : 'dias',
    'weeks': localConfig.value.valor === 1 ? 'semana' : 'semanas',
    'months': localConfig.value.valor === 1 ? 'mês' : 'meses',
  }

  return `Aguardar ${localConfig.value.valor} ${unitMap[localConfig.value.tipo] || 'dias'}`
})

// Validation
const isValid = computed(() => {
  return localConfig.value.tipo &&
         localConfig.value.valor !== null &&
         localConfig.value.valor > 0
})

const handleUpdate = () => {
  // Sempre enviar timezone como America/Sao_Paulo
  emit('update', {
    ...localConfig.value,
    timezone: 'America/Sao_Paulo'
  })
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
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.delay-input-group {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #1A1A1A;
  background: #ffffff;
  transition: all 0.15s ease;
}

.form-input:hover,
.form-select:hover {
  border-color: #9ca3af;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.delay-value {
  font-size: 14px;
  font-weight: 500;
}

.delay-unit {
  min-width: 120px;
  cursor: pointer;
}

/* Preview */
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
  gap: 6px;
}

.preview-main {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
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
