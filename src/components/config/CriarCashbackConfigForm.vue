<template>
  <div class="config-form">
    <!-- Avisos e Erros -->
    <div v-if="!validacao.valido" class="alert alert-error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div>
        <p class="alert-title">Erro de validação</p>
        <p class="alert-message">{{ validacao.erro }}</p>
      </div>
    </div>

    <div v-if="validacao.avisos && validacao.avisos.length > 0" class="alert alert-warning">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <div>
        <p class="alert-title">Avisos</p>
        <ul class="alert-list">
          <li v-for="(aviso, i) in validacao.avisos" :key="i">{{ aviso }}</li>
        </ul>
      </div>
    </div>

    <!-- Formulário -->
    <div class="form-grid">
      <!-- Cashback Percentual -->
      <div class="form-group">
        <label class="form-label">
          Cashback Percentual (%)
                  </label>
        <input
          type="number"
          v-model.number="localConfig.cashback_percentual"
          class="form-input"
          :class="{ error: !localConfig.cashback_percentual }"
          min="0"
          max="100"
          step="1"
          placeholder="10"
        />
        <p class="form-help">Percentual do pedido convertido em cashback</p>
      </div>

      <!-- Desconto Máximo -->
      <div class="form-group">
        <label class="form-label">
          Desconto Máximo (%)
                  </label>
        <input
          type="number"
          v-model.number="localConfig.desconto_max_percentual"
          class="form-input"
          :class="{ error: !localConfig.desconto_max_percentual }"
          min="0"
          max="100"
          step="1"
          placeholder="20"
        />
        <p class="form-help">Máximo que cashback pode descontar na próxima compra</p>
      </div>

      <!-- Dias para Ativação -->
      <div class="form-group">
        <label class="form-label">
          Dias para Ativação
                  </label>
        <input
          type="number"
          v-model.number="localConfig.dias_inicio"
          class="form-input"
          :class="{ error: localConfig.dias_inicio === null || localConfig.dias_inicio === undefined }"
          min="0"
          max="365"
          step="1"
          placeholder="3"
        />
        <p class="form-help">0 = ativo imediatamente</p>
      </div>

      <!-- Dias para Vencimento -->
      <div class="form-group">
        <label class="form-label">
          Dias para Vencimento
        </label>
        <input
          type="number"
          v-model.number="localConfig.dias_vencimento"
          class="form-input"
          :class="{ error: !localConfig.dias_vencimento || localConfig.dias_vencimento < 1 }"
          min="1"
          max="365"
          step="1"
          placeholder="30"
        />
        <p class="form-help">Contados a partir da criação do cashback</p>
      </div>
    </div>

    <!-- Preview dos Cálculos -->
    <div class="preview-box">
      <div class="preview-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <h4 class="preview-title">Preview (Pedido de R$ {{ formatarValor(pedidoExemplo.valor) }})</h4>
      </div>

      <div class="preview-grid">
        <div class="preview-item">
          <p class="preview-label">Valor do Cashback</p>
          <p class="preview-value preview-value-highlight">R$ {{ formatarValor(calculos.valor_cashback) }}</p>
        </div>

        <div class="preview-item">
          <p class="preview-label">Compra Mínima</p>
          <p class="preview-value preview-value-highlight">
            {{ calculos.compra_minima ? `R$ ${formatarValor(calculos.compra_minima)}` : 'Sem limite' }}
          </p>
        </div>

        <div class="preview-item">
          <p class="preview-label">Data de Ativação</p>
          <p class="preview-value">{{ formatarData(calculos.data_ativacao) }}</p>
        </div>

        <div class="preview-item">
          <p class="preview-label">Data de Vencimento</p>
          <p class="preview-value">{{ formatarData(calculos.data_vencimento) }}</p>
        </div>

        <div class="preview-item">
          <p class="preview-label">Status Inicial</p>
          <p class="preview-value">
            {{ calculos.status === 'ativo' ? '✅ Ativo imediatamente' : '⏳ Será ativado automaticamente' }}
          </p>
        </div>

        <div class="preview-item">
          <p class="preview-label">Janela de Uso</p>
          <p class="preview-value">{{ calculos.janela_uso }} dias</p>
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
        @click="handleUpdate"
        :disabled="!validacao.valido"
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
  desconto_max_percentual: 20,
  cashback_percentual: 10,
  dias_inicio: 3,
  dias_vencimento: 30,
})

// Pedido exemplo para preview
const pedidoExemplo = ref({
  valor: 200,
  data_pedido: new Date().toISOString(),
})

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig && Object.keys(newConfig).length > 0) {
    localConfig.value = {
      desconto_max_percentual: newConfig.desconto_max_percentual ?? 20,
      cashback_percentual: newConfig.cashback_percentual ?? 10,
      dias_inicio: newConfig.dias_inicio ?? 3,
      dias_vencimento: newConfig.dias_vencimento ?? 30,
    }
  }
}, { immediate: true, deep: true })

// Cálculos em tempo real
const calculos = computed(() => {
  const valor_cashback = pedidoExemplo.value.valor * (localConfig.value.cashback_percentual / 100)
  const compra_minima = localConfig.value.desconto_max_percentual > 0
    ? valor_cashback / (localConfig.value.desconto_max_percentual / 100)
    : null

  const data_pedido = new Date(pedidoExemplo.value.data_pedido)
  const data_ativacao = new Date(data_pedido)
  data_ativacao.setDate(data_ativacao.getDate() + (localConfig.value.dias_inicio || 0))

  const data_vencimento = new Date(data_pedido)
  data_vencimento.setDate(data_vencimento.getDate() + (localConfig.value.dias_vencimento || 0))

  const janela_uso = (localConfig.value.dias_vencimento || 0) - (localConfig.value.dias_inicio || 0)

  return {
    valor_cashback,
    compra_minima,
    data_ativacao,
    data_vencimento,
    janela_uso,
    status: localConfig.value.dias_inicio >= 1 ? 'criado' : 'ativo'
  }
})

// Validações
const validacao = computed(() => {
  const avisos = []

  // Validação: dias_vencimento deve ser maior que dias_inicio
  if (localConfig.value.dias_vencimento <= localConfig.value.dias_inicio) {
    return {
      valido: false,
      erro: 'Dias para vencimento deve ser maior que dias para ativação'
    }
  }

  // Aviso: janela de uso muito curta
  if (calculos.value.janela_uso < 7) {
    avisos.push(`Janela de uso muito curta: ${calculos.value.janela_uso} dias. Considere aumentar.`)
  }

  // Aviso: cashback muito alto
  if (localConfig.value.cashback_percentual > 20) {
    avisos.push(`Cashback de ${localConfig.value.cashback_percentual}% é alto. Verifique impacto no negócio.`)
  }

  // Aviso: desconto máximo muito alto
  if (localConfig.value.desconto_max_percentual > 50) {
    avisos.push(`Desconto máximo de ${localConfig.value.desconto_max_percentual}% é alto. Compra mínima será baixa.`)
  }

  return {
    valido: true,
    avisos: avisos.length > 0 ? avisos : undefined
  }
})

const formatarData = (data) => {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatarValor = (valor) => {
  return Number(valor).toFixed(2).replace('.', ',')
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


/* Alerts */
.alert {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

.alert svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-warning {
  background: #fefce8;
  border: 1px solid #fef08a;
  color: #ca8a04;
}

.alert-title {
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 13px;
}

.alert-message {
  margin: 0;
  font-size: 12px;
}

.alert-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
}

.alert-list li {
  margin-bottom: 2px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-label .required {
  color: #dc2626;
  margin-left: 2px;
}

.form-help {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #000000;
  background: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.form-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Preview Box */
.preview-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-top: 4px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-header svg {
  color: #7c3aed;
  flex-shrink: 0;
}

.preview-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-label {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.preview-value {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.preview-value-highlight {
  font-size: 14px;
  color: #1A1A1A;
  font-weight: 600;
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
