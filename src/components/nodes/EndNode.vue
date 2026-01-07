<template>
  <div class="end-node">
    <!-- Target Handle -->
    <Handle
      type="target"
      :position="Position.Top"
      class="target-handle"
    />

    <!-- End Label -->
    <span class="end-label">Fim</span>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'

defineProps({
  id: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  selected: { type: Boolean, default: false },
})
</script>

<style scoped>
.end-node {
  background: rgba(156, 163, 175, 0.15);
  border: none;
  border-radius: 12px;
  padding: 4px 12px;
  min-width: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-label {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.02em;
}

/* Handle styles - invisible */
.target-handle {
  width: 10px !important;
  height: 10px !important;
  background: transparent !important;
  border: none !important;
  opacity: 0;
  top: -5px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: transparent;
  border: none;
  opacity: 0;
}
</style>
