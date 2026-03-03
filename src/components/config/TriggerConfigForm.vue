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
        <optgroup label="Pedidos">
          <option value="order_status_change">Mudanca de Status do Pedido</option>
          <option value="carrinho_abandonado">Carrinho Abandonado Criado</option>
          <option value="pedido_entrega">Entrega / Rastreio do Pedido</option>
        </optgroup>
        <optgroup label="Clientes">
          <option value="aniversario">Aniversario do Cliente</option>
          <option value="rfm_mudanca_faixa">Mudanca de Faixa RFM</option>
        </optgroup>
      </select>
    </div>

    <!-- ======================================== -->
    <!-- STATUS SELECTION (order_status_change)   -->
    <!-- ======================================== -->
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

    <!-- ======================================== -->
    <!-- ANIVERSARIO CONFIG                       -->
    <!-- ======================================== -->
    <template v-if="localConfig.trigger_tipo === 'aniversario'">
      <div class="form-group">
        <label class="form-label">
          Quando disparar?
          <span class="required">*</span>
        </label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              v-model="aniversarioMode"
              value="no_dia"
              @change="handleAniversarioModeChange"
            />
            <span>No dia do aniversario</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="aniversarioMode"
              value="antes"
              @change="handleAniversarioModeChange"
            />
            <span>Dias antes do aniversario</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="aniversarioMode"
              value="depois"
              @change="handleAniversarioModeChange"
            />
            <span>Dias depois do aniversario</span>
          </label>
        </div>
      </div>

      <!-- Number of days (only for antes/depois) -->
      <div v-if="aniversarioMode !== 'no_dia'" class="form-group">
        <label class="form-label">
          Quantidade de dias
          <span class="required">*</span>
        </label>
        <input
          type="number"
          v-model.number="aniversarioDias"
          class="form-input"
          min="1"
          max="30"
          step="1"
          placeholder="Ex: 3"
          @input="handleAniversarioDiasChange"
        />
        <p class="form-help">
          {{ aniversarioMode === 'antes'
            ? 'Quantos dias ANTES do aniversario o fluxo deve disparar'
            : 'Quantos dias DEPOIS do aniversario o fluxo deve disparar'
          }}
        </p>
      </div>

      <!-- Info Box - Aniversario -->
      <div class="info-box info-box-birthday">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="info-content">
          <strong>Como funciona:</strong>
          <p>
            {{ aniversarioInfoText }}
            O cliente precisa ter a data de nascimento cadastrada.
          </p>
        </div>
      </div>

      <!-- Available Variables -->
      <div class="variables-section">
        <h4 class="variables-title">Variaveis disponiveis</h4>
        <div class="variable-tag" title="Idade do cliente no aniversario">
          <code>&#123;&#123;idade_aniversario&#125;&#125;</code>
          <span class="variable-desc">Idade do cliente</span>
        </div>
      </div>
    </template>

    <!-- ======================================== -->
    <!-- PEDIDO ENTREGA CONFIG                    -->
    <!-- ======================================== -->
    <template v-if="localConfig.trigger_tipo === 'pedido_entrega'">
      <div class="form-group">
        <label class="form-label">
          Tipo de evento
          <span class="required">*</span>
        </label>
        <select
          v-model="localConfig.subtipo"
          class="form-select"
          :class="{ error: !localConfig.subtipo }"
        >
          <option value="">Selecione...</option>
          <option value="status_entrega_alterado">Quando o status de entrega mudar</option>
          <option value="url_rastreio_criada">Quando o link de rastreio for criado</option>
        </select>
      </div>

      <!-- Status filter (only for status_entrega_alterado) -->
      <div v-if="localConfig.subtipo === 'status_entrega_alterado'" class="form-group">
        <label class="form-label">
          Apenas quando o status mudar para:
          <span class="optional">(opcional)</span>
        </label>
        <input
          type="text"
          v-model="localConfig.status_entrega_to"
          class="form-input"
          placeholder="Ex: entregue, em_transito"
        />
        <p class="form-help">
          Deixe vazio para disparar em qualquer mudanca de status de entrega
        </p>
      </div>

      <!-- Info Box - Entrega -->
      <div v-if="localConfig.subtipo" class="info-box info-box-delivery">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <div class="info-content">
          <strong>Como funciona:</strong>
          <p>
            {{ entregaInfoText }}
            Pedidos importados (historico) nao disparam este gatilho.
          </p>
        </div>
      </div>

      <!-- Available Variables -->
      <div v-if="localConfig.subtipo" class="variables-section">
        <h4 class="variables-title">Variaveis disponiveis</h4>
        <div class="variable-tag" title="Codigo de rastreamento">
          <code>&#123;&#123;codigo_rastreio&#125;&#125;</code>
          <span class="variable-desc">Codigo de rastreio</span>
        </div>
        <div class="variable-tag" title="URL de rastreio">
          <code>&#123;&#123;url_rastreio&#125;&#125;</code>
          <span class="variable-desc">URL de rastreio</span>
        </div>
        <div class="variable-tag" title="Nome da transportadora">
          <code>&#123;&#123;transportadora&#125;&#125;</code>
          <span class="variable-desc">Transportadora</span>
        </div>
        <div class="variable-tag" title="Status de entrega atual">
          <code>&#123;&#123;status_entrega&#125;&#125;</code>
          <span class="variable-desc">Status de entrega</span>
        </div>
      </div>
    </template>

    <!-- ======================================== -->
    <!-- RFM MUDANCA FAIXA CONFIG                 -->
    <!-- ======================================== -->
    <template v-if="localConfig.trigger_tipo === 'rfm_mudanca_faixa'">
      <div class="form-group">
        <label class="form-label">
          Direcao da mudanca
          <span class="optional">(opcional)</span>
        </label>
        <select
          v-model="localConfig.direcao"
          class="form-select"
        >
          <option value="">Qualquer mudanca</option>
          <option value="downgrade">Downgrade (piora)</option>
          <option value="upgrade">Upgrade (melhora)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">
          De qual segmento?
          <span class="optional">(opcional)</span>
        </label>
        <select
          v-model="localConfig.segmento_from"
          class="form-select"
        >
          <option value="">Qualquer segmento</option>
          <option
            v-for="seg in rfmSegmentOptions"
            :key="seg.value"
            :value="seg.value"
          >
            {{ seg.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">
          Para qual segmento?
          <span class="optional">(opcional)</span>
        </label>
        <select
          v-model="localConfig.segmento_to"
          class="form-select"
        >
          <option value="">Qualquer segmento</option>
          <option
            v-for="seg in rfmSegmentOptions"
            :key="seg.value"
            :value="seg.value"
          >
            {{ seg.label }}
          </option>
        </select>
      </div>

      <!-- Info Box - RFM -->
      <div class="info-box info-box-rfm">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <div class="info-content">
          <strong>Como funciona:</strong>
          <p>
            {{ rfmInfoText }}
            A analise RFM e recalculada diariamente.
          </p>
        </div>
      </div>

      <!-- Available Variables -->
      <div class="variables-section">
        <h4 class="variables-title">Variaveis disponiveis</h4>
        <div class="variable-tag" title="Segmento RFM atual do cliente">
          <code>&#123;&#123;segmento_rfm&#125;&#125;</code>
          <span class="variable-desc">Segmento RFM atual</span>
        </div>
        <div class="variable-tag" title="Segmento RFM anterior do cliente">
          <code>&#123;&#123;segmento_rfm_anterior&#125;&#125;</code>
          <span class="variable-desc">Segmento RFM anterior</span>
        </div>
      </div>
    </template>

    <!-- Advanced Settings -->
    <details class="advanced-settings">
      <summary class="advanced-summary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"></path>
        </svg>
        Configuracoes Avancadas
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
            Se ativado, o mesmo cliente pode entrar neste fluxo multiplas vezes
          </p>
        </div>

        <!-- Intervalo de Reentrada (condicional) -->
        <div v-if="localConfig.permitir_reentrada" class="form-group">
          <label class="form-label">
            Intervalo minimo entre entradas (dias)
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

// RFM Segment Options
const rfmSegmentOptions = [
  { value: 'champions', label: 'Champions' },
  { value: 'loyal', label: 'Loyal' },
  { value: 'potential_loyalists', label: 'Potential Loyalists' },
  { value: 'recent_customers', label: 'Recent Customers' },
  { value: 'promising', label: 'Promising' },
  { value: 'needs_attention', label: 'Needs Attention' },
  { value: 'about_to_sleep', label: 'About to Sleep' },
  { value: 'hibernating', label: 'Hibernating' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'cant_lose_them', label: "Can't Lose Them" },
  { value: 'lost', label: 'Lost' },
]

const localConfig = ref({
  trigger_tipo: '',
  status_from: null,  // SEMPRE null, conforme guia tecnico
  status_to: '',
  // Aniversario fields
  offset_dias: 0,
  // Pedido Entrega fields
  subtipo: '',
  status_entrega_to: '',
  // RFM fields
  direcao: '',
  segmento_from: '',
  segmento_to: '',
  // Advanced
  permitir_reentrada: false,
  intervalo_reentrada_dias: null,
})

// Aniversario helper state
const aniversarioMode = ref('no_dia')
const aniversarioDias = ref(3)

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = {
      trigger_tipo: newConfig.trigger_tipo || '',
      status_from: null,  // SEMPRE null
      status_to: newConfig.status_to || '',
      // Aniversario
      offset_dias: newConfig.offset_dias ?? 0,
      // Pedido Entrega
      subtipo: newConfig.subtipo || '',
      status_entrega_to: newConfig.status_entrega_to || '',
      // RFM
      direcao: newConfig.direcao || '',
      segmento_from: newConfig.segmento_from || '',
      segmento_to: newConfig.segmento_to || '',
      // Advanced
      permitir_reentrada: newConfig.permitir_reentrada || false,
      intervalo_reentrada_dias: newConfig.intervalo_reentrada_dias ?? null,
    }

    // Set aniversario mode from offset_dias
    const offset = newConfig.offset_dias ?? 0
    if (offset === 0) {
      aniversarioMode.value = 'no_dia'
      aniversarioDias.value = 3
    } else if (offset > 0) {
      aniversarioMode.value = 'antes'
      aniversarioDias.value = offset
    } else {
      aniversarioMode.value = 'depois'
      aniversarioDias.value = Math.abs(offset)
    }
  }
}, { immediate: true, deep: true })

// Handle trigger type change
const handleTriggerTypeChange = () => {
  // Reset all type-specific fields when changing type
  localConfig.value.status_from = null
  localConfig.value.status_to = ''
  localConfig.value.offset_dias = 0
  localConfig.value.subtipo = ''
  localConfig.value.status_entrega_to = ''
  localConfig.value.direcao = ''
  localConfig.value.segmento_from = ''
  localConfig.value.segmento_to = ''
  // Reset aniversario helper
  aniversarioMode.value = 'no_dia'
  aniversarioDias.value = 3
}

// Handle aniversario mode change
const handleAniversarioModeChange = () => {
  if (aniversarioMode.value === 'no_dia') {
    localConfig.value.offset_dias = 0
  } else if (aniversarioMode.value === 'antes') {
    localConfig.value.offset_dias = aniversarioDias.value || 3
  } else {
    // depois = negative offset
    localConfig.value.offset_dias = -(aniversarioDias.value || 1)
  }
}

// Handle aniversario dias input change
const handleAniversarioDiasChange = () => {
  const dias = Math.max(1, Math.min(30, aniversarioDias.value || 1))
  aniversarioDias.value = dias
  if (aniversarioMode.value === 'antes') {
    localConfig.value.offset_dias = dias
  } else if (aniversarioMode.value === 'depois') {
    localConfig.value.offset_dias = -dias
  }
}

// Selected status info (for order_status_change)
const selectedStatus = computed(() => {
  return props.statusOptions.find(s => s.value === localConfig.value.status_to)
})

const selectedStatusLabel = computed(() => {
  return selectedStatus.value?.label || 'Nao definido'
})

const selectedStatusDescription = computed(() => {
  return selectedStatus.value?.description || ''
})

// Preview texts
const previewTipoText = computed(() => {
  const labels = {
    order_status_change: 'Mudanca de Status do Pedido',
    carrinho_abandonado: 'Carrinho Abandonado',
    aniversario: 'Aniversario do Cliente',
    pedido_entrega: 'Entrega / Rastreio do Pedido',
    rfm_mudanca_faixa: 'Mudanca de Faixa RFM',
  }
  return labels[localConfig.value.trigger_tipo] || 'Nao definido'
})

const previewStatusText = computed(() => {
  const tipo = localConfig.value.trigger_tipo

  if (tipo === 'carrinho_abandonado') {
    return 'Carrinho abandonado criado na loja'
  }

  if (tipo === 'order_status_change') {
    if (!localConfig.value.status_to) return 'Selecione um status'
    return `Status = ${selectedStatusLabel.value}`
  }

  if (tipo === 'aniversario') {
    const offset = localConfig.value.offset_dias
    if (offset === 0) return 'No dia do aniversario'
    if (offset > 0) return `${offset} dia(s) antes do aniversario`
    return `${Math.abs(offset)} dia(s) depois do aniversario`
  }

  if (tipo === 'pedido_entrega') {
    if (!localConfig.value.subtipo) return 'Selecione o tipo de evento'
    if (localConfig.value.subtipo === 'url_rastreio_criada') {
      return 'Link de rastreio criado'
    }
    const statusFilter = localConfig.value.status_entrega_to
    if (statusFilter) return `Status de entrega = "${statusFilter}"`
    return 'Qualquer mudanca de status de entrega'
  }

  if (tipo === 'rfm_mudanca_faixa') {
    const parts = []
    if (localConfig.value.direcao === 'downgrade') parts.push('Downgrade')
    else if (localConfig.value.direcao === 'upgrade') parts.push('Upgrade')
    else parts.push('Qualquer mudanca')

    if (localConfig.value.segmento_from) {
      parts.push(`de ${localConfig.value.segmento_from}`)
    }
    if (localConfig.value.segmento_to) {
      parts.push(`para ${localConfig.value.segmento_to}`)
    }
    return parts.join(' ')
  }

  return 'Selecione um tipo'
})

// Aniversario info text
const aniversarioInfoText = computed(() => {
  const offset = localConfig.value.offset_dias
  if (offset === 0) return 'Este fluxo sera disparado no dia do aniversario do cliente.'
  if (offset > 0) return `Este fluxo sera disparado ${offset} dia(s) antes do aniversario do cliente.`
  return `Este fluxo sera disparado ${Math.abs(offset)} dia(s) depois do aniversario do cliente.`
})

// Entrega info text
const entregaInfoText = computed(() => {
  if (localConfig.value.subtipo === 'url_rastreio_criada') {
    return 'Este fluxo sera disparado quando um link de rastreio for adicionado ao pedido pela primeira vez.'
  }
  if (localConfig.value.subtipo === 'status_entrega_alterado') {
    const statusFilter = localConfig.value.status_entrega_to
    if (statusFilter) {
      return `Este fluxo sera disparado quando o status de entrega mudar para "${statusFilter}".`
    }
    return 'Este fluxo sera disparado sempre que o status de entrega do pedido mudar.'
  }
  return ''
})

// RFM info text
const rfmInfoText = computed(() => {
  const parts = ['Este fluxo sera disparado quando um cliente']
  if (localConfig.value.direcao === 'downgrade') {
    parts.push('piorar de faixa RFM')
  } else if (localConfig.value.direcao === 'upgrade') {
    parts.push('melhorar de faixa RFM')
  } else {
    parts.push('mudar de faixa RFM')
  }
  if (localConfig.value.segmento_from) {
    parts[parts.length - 1] += ` (saindo de ${localConfig.value.segmento_from})`
  }
  if (localConfig.value.segmento_to) {
    parts[parts.length - 1] += ` para ${localConfig.value.segmento_to}`
  }
  parts[parts.length - 1] += '.'
  return parts.join(' ')
})

// Handle reentrada change
const handleReentradaChange = () => {
  // Se desativar reentrada, limpar intervalo
  if (!localConfig.value.permitir_reentrada) {
    localConfig.value.intervalo_reentrada_dias = null
  } else {
    // Se ativar, definir valor padrao de 0 (imediato)
    localConfig.value.intervalo_reentrada_dias = 0
  }
}

// Validation
const isValid = computed(() => {
  if (!localConfig.value.trigger_tipo) return false

  switch (localConfig.value.trigger_tipo) {
    case 'order_status_change':
      return !!localConfig.value.status_to

    case 'carrinho_abandonado':
      return true

    case 'aniversario':
      // offset_dias is always set (defaults to 0)
      return true

    case 'pedido_entrega':
      return !!localConfig.value.subtipo

    case 'rfm_mudanca_faixa':
      // All fields optional
      return true

    default:
      return false
  }
})

const handleUpdate = () => {
  const tipo = localConfig.value.trigger_tipo

  // Build config with common fields
  const config = {
    trigger_tipo: tipo,
    status_from: null,
    permitir_reentrada: localConfig.value.permitir_reentrada,
    intervalo_reentrada_dias: localConfig.value.permitir_reentrada
      ? (localConfig.value.intervalo_reentrada_dias ?? 0)
      : null,
  }

  // Add type-specific fields
  switch (tipo) {
    case 'order_status_change':
      config.status_to = localConfig.value.status_to
      break

    case 'carrinho_abandonado':
      // No additional config
      break

    case 'aniversario':
      config.offset_dias = localConfig.value.offset_dias
      break

    case 'pedido_entrega':
      config.subtipo = localConfig.value.subtipo
      if (localConfig.value.subtipo === 'status_entrega_alterado' && localConfig.value.status_entrega_to) {
        config.status_entrega_to = localConfig.value.status_entrega_to
      }
      break

    case 'rfm_mudanca_faixa':
      if (localConfig.value.direcao) config.direcao = localConfig.value.direcao
      if (localConfig.value.segmento_from) config.segmento_from = localConfig.value.segmento_from
      if (localConfig.value.segmento_to) config.segmento_to = localConfig.value.segmento_to
      break
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

/* Radio Group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
}

.radio-label input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #7c3aed;
  cursor: pointer;
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

.info-box-birthday {
  background: #fdf2f8;
  border-color: #fbcfe8;
}

.info-box-birthday .info-icon {
  color: #db2777;
}

.info-box-birthday .info-content {
  color: #9d174d;
}

.info-box-birthday .info-content p {
  color: #831843;
}

.info-box-delivery {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.info-box-delivery .info-icon {
  color: #059669;
}

.info-box-delivery .info-content {
  color: #065f46;
}

.info-box-delivery .info-content p {
  color: #064e3b;
}

.info-box-rfm {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.info-box-rfm .info-icon {
  color: #4f46e5;
}

.info-box-rfm .info-content {
  color: #3730a3;
}

.info-box-rfm .info-content p {
  color: #312e81;
}

/* Variables Section */
.variables-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px 14px;
}

.variables-title {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.variable-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.variable-tag code {
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #7c3aed;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.variable-tag .variable-desc {
  font-size: 11px;
  color: #6b7280;
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
