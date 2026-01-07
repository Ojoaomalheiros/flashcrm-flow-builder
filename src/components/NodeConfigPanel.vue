<template>
  <div class="config-panel" :class="[`position-${position}`]" :style="panelStyle">
    <!-- Header -->
    <div class="panel-header" :style="headerStyle">
      <div class="header-info">
        <div class="header-icon">
          <!-- Trigger Icon -->
          <svg v-if="node?.type === 'trigger'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <!-- SMS Icon -->
          <svg v-else-if="node?.type === 'send_sms'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <!-- WhatsApp Icon -->
          <svg v-else-if="node?.type === 'send_whatsapp'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
          </svg>
          <!-- Email Icon -->
          <svg v-else-if="node?.type === 'send_email'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <!-- Delay Icon -->
          <svg v-else-if="node?.type === 'delay'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <!-- Condition Icon -->
          <svg v-else-if="node?.type === 'condition'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="3" r="2" fill="currentColor"></circle>
            <path d="M12 5v7"></path>
            <path d="M12 12h-6v6"></path>
            <path d="M12 12h6v6"></path>
            <circle cx="6" cy="20" r="2" fill="currentColor"></circle>
            <circle cx="18" cy="20" r="2" fill="currentColor"></circle>
          </svg>
          <!-- Criar Cashback Icon -->
          <svg v-else-if="node?.type === 'criar_cashback'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h3 class="header-title">{{ nodeTitle }}</h3>
      </div>
      <button class="close-btn" @click="handleClose" title="Fechar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <!-- Trigger Node Config -->
      <template v-if="node?.type === 'trigger'">
        <TriggerConfigForm
          :config="localConfig"
          :status-options="statusOptions"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Send SMS Config -->
      <template v-else-if="node?.type === 'send_sms'">
        <SendSMSConfigForm
          :config="localConfig"
          :templates="smsTemplates"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Send WhatsApp Config -->
      <template v-else-if="node?.type === 'send_whatsapp'">
        <SendWhatsAppConfigForm
          :config="localConfig"
          :templates="whatsappTemplates"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Send Email Config -->
      <template v-else-if="node?.type === 'send_email'">
        <SendEmailConfigForm
          :config="localConfig"
          :templates="emailTemplates"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Delay Config -->
      <template v-else-if="node?.type === 'delay'">
        <DelayConfigForm
          :config="localConfig"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Condition Config -->
      <template v-else-if="node?.type === 'condition'">
        <ConditionConfigForm
          :config="localConfig"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Criar Cashback Config -->
      <template v-else-if="node?.type === 'criar_cashback'">
        <CriarCashbackConfigForm
          :config="localConfig"
          @update="handleConfigUpdate"
          @close="handleClose"
        />
      </template>

      <!-- Default/Unknown -->
      <template v-else>
        <div class="empty-config">
          <p>Selecione um tipo de node para configurar</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TriggerConfigForm from './config/TriggerConfigForm.vue'
import SendSMSConfigForm from './config/SendSMSConfigForm.vue'
import SendWhatsAppConfigForm from './config/SendWhatsAppConfigForm.vue'
import SendEmailConfigForm from './config/SendEmailConfigForm.vue'
import DelayConfigForm from './config/DelayConfigForm.vue'
import ConditionConfigForm from './config/ConditionConfigForm.vue'
import CriarCashbackConfigForm from './config/CriarCashbackConfigForm.vue'

const props = defineProps({
  node: { type: Object, default: null },
  statusOptions: { type: Array, default: () => [] },
  smsTemplates: { type: Array, default: () => [] },
  whatsappTemplates: { type: Array, default: () => [] },
  emailTemplates: { type: Array, default: () => [] },
  position: { type: String, default: 'right' },
  width: { type: String, default: '320px' },
})

const emit = defineEmits(['update-config', 'close', 'delete-node'])

// Local config state
const localConfig = ref({})

// Node type info
const nodeTypeConfig = {
  trigger: { title: 'Configurar Gatilho', color: '#7c3aed', bg: '#faf5ff' },
  send_sms: { title: 'Configurar SMS', color: '#10b981', bg: '#f0fdf4' },
  send_whatsapp: { title: 'Configurar WhatsApp', color: '#10b981', bg: '#f0fdf4' },
  send_email: { title: 'Configurar E-mail', color: '#3b82f6', bg: '#eff6ff' },
  delay: { title: 'Configurar Delay', color: '#7c3aed', bg: '#faf5ff' },
  condition: { title: 'Configurar Condição', color: '#7c3aed', bg: '#faf5ff' },
  criar_cashback: { title: 'Configurar Cashback', color: '#f59e0b', bg: '#fffbeb' },
}

const currentTypeConfig = computed(() => {
  return nodeTypeConfig[props.node?.type] || { title: 'Configurar', color: '#7c3aed', bg: '#f9f9f9' }
})

const nodeTitle = computed(() => currentTypeConfig.value.title)

const panelStyle = computed(() => ({
  width: props.width,
  '--node-color': currentTypeConfig.value.color,
  '--node-bg': currentTypeConfig.value.bg,
}))

const isValid = computed(() => props.node?.data?.valid ?? false)
const errors = computed(() => props.node?.data?.errors || [])

// Watch for node changes
watch(() => props.node, (newNode) => {
  if (newNode?.data?.config) {
    localConfig.value = { ...newNode.data.config }
  }
}, { immediate: true, deep: true })

// Handlers
const handleConfigUpdate = (newConfig) => {
  localConfig.value = { ...newConfig }
  emit('update-config', {
    nodeId: props.node?.id,
    config: localConfig.value,
  })
}

const handleClose = () => {
  emit('close')
}

const handleDelete = () => {
  if (props.node?.id) {
    emit('delete-node', props.node.id)
  }
}

</script>

<style scoped>
.config-panel {
  background: #fafafa;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid #e5e7eb;
}

.config-panel.position-left {
  border-left: none;
  border-right: 1px solid #e5e7eb;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--node-bg, #f9f9f9);
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  color: var(--node-color, #7c3aed);
}

.header-icon svg {
  width: 18px;
  height: 18px;
}

.header-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
}

.close-btn {
  background: none;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #f9f9f9;
  color: #1A1A1A;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.empty-config {
  text-align: center;
  color: #9ca3af;
  padding: 40px 20px;
  font-size: 13px;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 500;
  border-top: 1px solid #e5e7eb;
}

.validation-status.valid {
  background: #f9f9f9;
  color: #374151;
}

.validation-status.invalid {
  background: #fef2f2;
  color: #dc2626;
}

.validation-icon {
  font-size: 12px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.validation-status.valid .validation-icon {
  background: #7c3aed;
  color: #fff;
}

.validation-status.invalid .validation-icon {
  background: #dc2626;
  color: #fff;
}

.errors-list {
  padding: 0 20px 12px;
  background: #fef2f2;
}

.error-item {
  font-size: 11px;
  color: #dc2626;
  padding: 3px 0;
}

.error-item::before {
  content: '• ';
  margin-right: 4px;
}

.panel-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}
</style>
