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
      <div class="node-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <span v-if="!data?.config?.status_to" class="status-pill unconfigured">
          Nao configurado
        </span>
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

// Check if config exists
const hasConfig = computed(() => {
  return props.data?.config && Object.keys(props.data.config).length > 0
})

// Validation status
const isValid = computed(() => {
  // Check data.valid flag if present
  if (props.data?.valid !== undefined) {
    return props.data.valid
  }
  // Otherwise check if status_to is configured
  return Boolean(props.data?.config?.status_to)
})

// Error message
const errorMessage = computed(() => {
  if (props.data?.errors && props.data.errors.length > 0) {
    return props.data.errors[0]
  }
  if (!props.data?.config?.status_to) {
    return 'Status de destino obrigatorio'
  }
  return ''
})

// Computed description for the trigger status
const statusDescription = computed(() => {
  const config = props.data?.config
  if (!config) return 'Clique para configurar'

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
