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

    <!-- Aguardar até um horário específico -->
    <div class="form-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="localConfig.delay_until_time"
        />
        <span>Aguardar até um horário específico do dia</span>
      </label>

      <div v-if="localConfig.delay_until_time" class="conditional-fields">
        <label class="form-sublabel">Selecione um horário</label>
        <input
          type="time"
          v-model="localConfig.specific_time"
          class="form-input time-input"
          placeholder="--:--"
        />
      </div>
    </div>

    <!-- Aguardar até dias específicos da semana -->
    <div class="form-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="localConfig.delay_until_days"
        />
        <span>Aguardar até dias específicos da semana</span>
      </label>

      <div v-if="localConfig.delay_until_days" class="conditional-fields">
        <div class="days-selector">
          <div class="days-pills">
            <span
              v-for="day in selectedDays"
              :key="day"
              class="day-pill"
            >
              {{ day }}
              <button
                class="day-remove"
                @click="removeDay(day)"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          </div>

          <!-- Dropdown para adicionar dias -->
          <select
            v-model="dayToAdd"
            class="form-select days-dropdown"
            @change="addDay"
          >
            <option value="">Adicionar dia...</option>
            <option
              v-for="day in availableDays"
              :key="day"
              :value="day"
            >
              {{ day }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Visualização -->
    <div class="preview-box">
      <h4 class="preview-title">Visualização</h4>
      <div class="preview-content">
        <p class="preview-main">{{ previewMainText }}</p>
        <p v-if="previewDetails.length > 0" class="preview-details">
          <span v-for="(detail, index) in previewDetails" :key="index">
            {{ detail }}<template v-if="index < previewDetails.length - 1"> • </template>
          </span>
        </p>
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
  delay_until_time: false,
  specific_time: '',
  delay_until_days: false,
  specific_days: [],
})

const dayToAdd = ref('')

const allDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = {
      tipo: newConfig.tipo || '',
      valor: newConfig.valor ?? null,
      delay_until_time: newConfig.delay_until_time || false,
      specific_time: newConfig.specific_time || '',
      delay_until_days: newConfig.delay_until_days || false,
      specific_days: newConfig.specific_days || [],
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

const selectedDays = computed(() => {
  return localConfig.value.specific_days || []
})

const availableDays = computed(() => {
  return allDays.filter(day => !selectedDays.value.includes(day))
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

const previewDetails = computed(() => {
  const details = []

  if (localConfig.value.delay_until_time && localConfig.value.specific_time) {
    details.push(`Até às ${localConfig.value.specific_time} (Horário de São Paulo)`)
  }

  if (localConfig.value.delay_until_days && selectedDays.value.length > 0) {
    details.push(`Apenas em: ${selectedDays.value.join(', ')}`)
  }

  return details
})

const handleTypeChange = () => {
  // Adjust value if it exceeds new max
  if (localConfig.value.valor > maxValue.value) {
    localConfig.value.valor = Math.min(localConfig.value.valor, maxValue.value)
  }
}

const addDay = () => {
  if (dayToAdd.value && !selectedDays.value.includes(dayToAdd.value)) {
    localConfig.value.specific_days = [...selectedDays.value, dayToAdd.value]
    dayToAdd.value = ''
  }
}

const removeDay = (day) => {
  localConfig.value.specific_days = selectedDays.value.filter(d => d !== day)
}

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

.form-sublabel {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 4px;
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

/* Checkbox label */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  padding: 4px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #7c3aed;
  cursor: pointer;
}

/* Conditional fields */
.conditional-fields {
  margin-left: 24px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-input {
  font-family: monospace;
}

/* Days selector */
.days-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.days-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 32px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.day-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 12px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.day-remove {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.day-remove:hover {
  background: #f3f4f6;
  color: #1A1A1A;
}

.days-dropdown {
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

.preview-details {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
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
