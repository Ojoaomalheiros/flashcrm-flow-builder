<template>
  <div class="trigger-node" :class="{ selected: selected, invalid: !isValid }">
    <!-- Target Handle (for future use if needed) -->
    <Handle
      type="target"
      :position="Position.Top"
      :style="{ visibility: 'hidden' }"
    />

    <!-- Node Content -->
    <div class="node-header">
      <div class="node-icon" :class="nodeIconClass">
        <!-- Cart icon for carrinho_abandonado -->
        <svg v-if="isCarrinhoAbandonado" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <!-- Birthday icon for aniversario -->
        <svg v-else-if="isAniversario" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <!-- Truck icon for pedido_entrega -->
        <svg v-else-if="isPedidoEntrega" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        <!-- Chart icon for rfm_mudanca_faixa -->
        <svg v-else-if="isRfmMudanca" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <!-- Lightning icon for order_status_change / default -->
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <span class="node-title">{{ data?.label || 'Gatilho' }}</span>
    </div>

    <div class="node-body">
      <div class="node-info">
        <span class="info-label">Quando:</span>
        <span class="info-value">{{ statusDescription }}</span>
      </div>

      <!-- Status Pills -->
      <div v-if="hasConfig" class="status-pills">
        <!-- Carrinho Abandonado pill -->
        <template v-if="isCarrinhoAbandonado">
          <span class="status-pill cart">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: middle;">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Abandonado
          </span>
        </template>

        <!-- Aniversario pill -->
        <template v-else-if="isAniversario">
          <span class="status-pill birthday">{{ aniversarioPillText }}</span>
        </template>

        <!-- Pedido Entrega pill -->
        <template v-else-if="isPedidoEntrega">
          <span class="status-pill delivery">{{ entregaPillText }}</span>
        </template>

        <!-- RFM Mudanca pill -->
        <template v-else-if="isRfmMudanca">
          <span class="status-pill rfm">{{ rfmPillText }}</span>
        </template>

        <!-- Order Status Change pills -->
        <template v-else>
          <span v-if="data?.config?.status_from" class="status-pill from">
            {{ data.config.status_from }}
          </span>
          <span v-if="data?.config?.status_from" class="status-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
          <span v-if="data?.config?.status_to" class="status-pill to">
            {{ data.config.status_to }}
          </span>
          <span v-if="!data?.config?.status_to && !isNewTriggerType" class="status-pill unconfigured">
            Nao configurado
          </span>
        </template>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="!isValid && errorMessage" class="error-message">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Add Node Button -->
    <button
      class="add-node-button nodrag"
      @click.stop="handleAddNode"
      title="Adicionar acao"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Source Handle -->
    <Handle
      type="source"
      :position="Position.Bottom"
      class="source-handle"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Get Handle and Position from parent component (via window)
const Handle = window.__vueFlowHandle
const Position = window.__vueFlowPosition

const props = defineProps({
  id: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  selected: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
})

const emit = defineEmits(['add-node'])

// Check trigger type
const triggerTipo = computed(() => props.data?.config?.trigger_tipo || '')
const isCarrinhoAbandonado = computed(() => triggerTipo.value === 'carrinho_abandonado')
const isAniversario = computed(() => triggerTipo.value === 'aniversario')
const isPedidoEntrega = computed(() => triggerTipo.value === 'pedido_entrega')
const isRfmMudanca = computed(() => triggerTipo.value === 'rfm_mudanca_faixa')
const isNewTriggerType = computed(() =>
  isAniversario.value || isPedidoEntrega.value || isRfmMudanca.value
)

// Node icon class based on trigger type
const nodeIconClass = computed(() => {
  if (isCarrinhoAbandonado.value) return 'node-icon-cart'
  if (isAniversario.value) return 'node-icon-birthday'
  if (isPedidoEntrega.value) return 'node-icon-delivery'
  if (isRfmMudanca.value) return 'node-icon-rfm'
  return ''
})

// Check if config exists
const hasConfig = computed(() => {
  return props.data?.config && Object.keys(props.data.config).length > 0
})

// Pill texts for new trigger types
const aniversarioPillText = computed(() => {
  const offset = props.data?.config?.offset_dias ?? 0
  if (offset === 0) return 'No dia'
  if (offset > 0) return `${offset}d antes`
  return `${Math.abs(offset)}d depois`
})

const entregaPillText = computed(() => {
  const subtipo = props.data?.config?.subtipo
  if (subtipo === 'url_rastreio_criada') return 'Rastreio criado'
  if (subtipo === 'status_entrega_alterado') {
    const statusTo = props.data?.config?.status_entrega_to
    if (statusTo) return `Entrega: ${statusTo}`
    return 'Status entrega'
  }
  return 'Nao configurado'
})

const rfmPillText = computed(() => {
  const direcao = props.data?.config?.direcao
  if (direcao === 'downgrade') return 'Downgrade'
  if (direcao === 'upgrade') return 'Upgrade'
  return 'Qualquer mudanca'
})

// Validation status
const isValid = computed(() => {
  // Check data.valid flag if present
  if (props.data?.valid !== undefined) {
    return props.data.valid
  }
  // Must have a trigger type selected
  if (!triggerTipo.value) return false
  // carrinho_abandonado is always valid once selected
  if (isCarrinhoAbandonado.value) return true
  // aniversario is always valid (offset defaults to 0)
  if (isAniversario.value) return true
  // rfm_mudanca_faixa is always valid (all optional fields)
  if (isRfmMudanca.value) return true
  // pedido_entrega needs subtipo
  if (isPedidoEntrega.value) return Boolean(props.data?.config?.subtipo)
  // order_status_change needs status_to
  return Boolean(props.data?.config?.status_to)
})

// Error message
const errorMessage = computed(() => {
  if (props.data?.errors && props.data.errors.length > 0) {
    return props.data.errors[0]
  }
  if (!triggerTipo.value) {
    return 'Tipo de gatilho nao selecionado'
  }
  if (isPedidoEntrega.value && !props.data?.config?.subtipo) {
    return 'Tipo de evento de entrega obrigatorio'
  }
  if (!isCarrinhoAbandonado.value && !isAniversario.value && !isPedidoEntrega.value && !isRfmMudanca.value && !props.data?.config?.status_to) {
    return 'Status de destino obrigatorio'
  }
  return ''
})

// Computed description for the trigger status
const statusDescription = computed(() => {
  const config = props.data?.config
  if (!config || !config.trigger_tipo) return 'Clique para configurar'

  if (config.trigger_tipo === 'carrinho_abandonado') {
    return 'Carrinho abandonado criado'
  }

  if (config.trigger_tipo === 'aniversario') {
    const offset = config.offset_dias ?? 0
    if (offset === 0) return 'No aniversario do cliente'
    if (offset > 0) return `${offset} dia(s) antes do aniversario`
    return `${Math.abs(offset)} dia(s) depois do aniversario`
  }

  if (config.trigger_tipo === 'pedido_entrega') {
    if (!config.subtipo) return 'Clique para configurar'
    if (config.subtipo === 'url_rastreio_criada') return 'Link de rastreio criado'
    if (config.subtipo === 'status_entrega_alterado') {
      if (config.status_entrega_to) return `Status entrega = "${config.status_entrega_to}"`
      return 'Mudanca de status de entrega'
    }
    return 'Evento de entrega'
  }

  if (config.trigger_tipo === 'rfm_mudanca_faixa') {
    const parts = []
    if (config.direcao === 'downgrade') parts.push('Downgrade RFM')
    else if (config.direcao === 'upgrade') parts.push('Upgrade RFM')
    else parts.push('Mudanca de faixa RFM')
    return parts.join(' ')
  }

  // order_status_change
  const statusTo = config.status_to
  if (!statusTo) return 'Clique para configurar'

  if (config.status_from) {
    return 'Mudanca de status'
  }
  return 'Quando status for'
})

// Handle add node button click
const handleAddNode = () => {
  emit('add-node', {
    sourceNodeId: props.id,
    sourceNodeType: 'trigger',
    position: Position.Bottom,
  })
}
</script>

<style scoped>
.trigger-node {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0;
  width: 280px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.15s ease;
  --node-color: #7c3aed;
  --node-bg: #f9f9f9;
}

.trigger-node:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.trigger-node.selected {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.trigger-node.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.trigger-node.invalid.selected {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px 8px 0 0;
}

.node-icon {
  width: 28px;
  height: 28px;
  background: var(--node-bg, #f9f9f9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--node-color, #7c3aed);
  flex-shrink: 0;
}

.node-title {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
}

.node-body {
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.info-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

/* Status Pills */
.status-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-pill.from {
  background: #f9f9f9;
  border: 1px solid #d1d5db;
  color: #6b7280;
}

.status-pill.to {
  background: #f9f9f9;
  border: 1px solid #7c3aed;
  color: #7c3aed;
}

.status-pill.unconfigured {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-style: italic;
}

.status-pill.cart {
  background: #fefce8;
  border: 1px solid #d97706;
  color: #92400e;
  display: inline-flex;
  align-items: center;
}

.status-pill.birthday {
  background: #fdf2f8;
  border: 1px solid #db2777;
  color: #9d174d;
}

.status-pill.delivery {
  background: #ecfdf5;
  border: 1px solid #059669;
  color: #065f46;
}

.status-pill.rfm {
  background: #eef2ff;
  border: 1px solid #4f46e5;
  color: #3730a3;
}

/* Node icon color variants */
.node-icon-cart {
  background: #fefce8 !important;
  border-color: rgba(217, 119, 6, 0.2) !important;
  color: #d97706 !important;
}

.node-icon-birthday {
  background: #fdf2f8 !important;
  border-color: rgba(219, 39, 119, 0.2) !important;
  color: #db2777 !important;
}

.node-icon-delivery {
  background: #ecfdf5 !important;
  border-color: rgba(5, 150, 105, 0.2) !important;
  color: #059669 !important;
}

.node-icon-rfm {
  background: #eef2ff !important;
  border-color: rgba(79, 70, 229, 0.2) !important;
  color: #4f46e5 !important;
}

.status-arrow {
  color: #9ca3af;
  display: flex;
  align-items: center;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fef2f2;
  border-top: 1px solid #fecaca;
  font-size: 11px;
  color: #dc2626;
  border-radius: 0 0 8px 8px;
}

.error-message svg {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

.add-node-button {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #d1d5db;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-node-button:hover {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #fff;
  transform: translateX(-50%) scale(1.05);
}

.add-node-button:active {
  transform: translateX(-50%) scale(0.98);
}

/* Handle styles */
.source-handle {
  width: 10px !important;
  height: 10px !important;
  background: transparent !important;
  border: none !important;
  bottom: -5px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  opacity: 0;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: transparent;
  border: none;
  opacity: 0;
}
</style>
