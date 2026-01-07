<template>
  <div class="conditional-branch-node" :class="{ selected: selected, 'branch-sim': branchType === 'true', 'branch-nao': branchType === 'false' }">
    <!-- Target Handle (incoming from condition) -->
    <Handle
      type="target"
      :position="Position.Top"
      class="target-handle"
    />

    <!-- Node Content - Simple label only -->
    <span class="branch-label">{{ branchType === 'true' ? 'Sim' : 'Não' }}</span>

    <!-- Add Node Button -->
    <button
      class="add-node-button nodrag"
      @click.stop="handleAddNode"
      title="Adicionar ação"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Source Handle (outgoing to next action) -->
    <Handle
      type="source"
      :position="Position.Bottom"
      class="source-handle"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  id: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  selected: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
})

const emit = defineEmits(['add-node'])

const branchType = computed(() => props.data?.branchType || 'true')

const handleAddNode = () => {
  emit('add-node', {
    sourceNodeId: props.id,
    sourceNodeType: 'conditional_branch',
    position: Position.Bottom,
  })
}
</script>

<style scoped>
.conditional-branch-node {
  background: transparent;
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  min-width: 60px;
  position: relative;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Sim branch styling - soft green */
.conditional-branch-node.branch-sim {
  background: rgba(16, 185, 129, 0.12);
}

.conditional-branch-node.branch-sim:hover {
  background: rgba(16, 185, 129, 0.18);
}

.conditional-branch-node.branch-sim.selected {
  background: rgba(16, 185, 129, 0.22);
}

.conditional-branch-node.branch-sim .branch-label {
  color: #059669;
}

/* Não branch styling - soft red */
.conditional-branch-node.branch-nao {
  background: rgba(239, 68, 68, 0.10);
}

.conditional-branch-node.branch-nao:hover {
  background: rgba(239, 68, 68, 0.16);
}

.conditional-branch-node.branch-nao.selected {
  background: rgba(239, 68, 68, 0.20);
}

.conditional-branch-node.branch-nao .branch-label {
  color: #dc2626;
}

.branch-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.add-node-button {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  z-index: 10;
  opacity: 0;
}

.conditional-branch-node:hover .add-node-button {
  opacity: 1;
}

.branch-sim .add-node-button:hover {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
  transform: translateX(-50%) scale(1.1);
}

.branch-nao .add-node-button:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
  transform: translateX(-50%) scale(1.1);
}

.add-node-button:active {
  transform: translateX(-50%) scale(0.95);
}

/* Handle styles */
.target-handle,
.source-handle {
  width: 10px !important;
  height: 10px !important;
  background: transparent !important;
  border: none !important;
  opacity: 0;
  left: 50% !important;
  transform: translateX(-50%) !important;
}

.target-handle {
  top: -5px !important;
}

.source-handle {
  bottom: -5px !important;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: transparent;
  border: none;
  opacity: 0;
}
</style>
