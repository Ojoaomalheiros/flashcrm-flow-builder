<template>
  <div class="action-node" :class="[nodeTypeClass, { selected: selected, invalid: !isValid }]">
    <!-- Target Handle -->
    <Handle
      type="target"
      :position="Position.Top"
      class="target-handle"
    />

    <!-- Three-Dot Menu -->
    <div class="node-menu nodrag">
      <button class="menu-button" @click="toggleMenu" title="Opções">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <circle cx="12" cy="19" r="2"></circle>
        </svg>
      </button>
      <div v-if="showMenu" class="menu-dropdown" @click.stop>
        <button class="menu-item menu-item-delete" @click="handleDelete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Excluir</span>
        </button>
      </div>
    </div>

    <!-- Node Content -->
    <div class="node-header">
      <div class="node-icon">
        <component :is="nodeIcon" />
      </div>
      <span class="node-title">{{ data?.label || nodeTypeLabel }}</span>
    </div>

    <div class="node-body">
      <!-- Config Summary -->
      <div class="config-summary">
        <component :is="configSummary" />
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

    <!-- Add Node Button (não aparece para node de condição) -->
    <button
      v-if="type !== 'condition'"
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
import { computed, h, ref } from 'vue'

// Get Handle and Position from parent component (via window)
const Handle = window.__vueFlowHandle
const Position = window.__vueFlowPosition

const props = defineProps({
  id: { type: String, required: true },
  type: { type: String, default: 'default' },
  data: { type: Object, default: () => ({}) },
  selected: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
})

const emit = defineEmits(['add-node', 'delete-node'])

// Three-dot menu state
const showMenu = ref(false)

// Node type configurations
const nodeTypeConfig = {
  send_sms: {
    label: 'Enviar SMS',
    color: '#10b981',
    gradient: '#10b981',
  },
  send_whatsapp: {
    label: 'Enviar WhatsApp',
    color: '#10b981',
    gradient: '#10b981',
  },
  send_email: {
    label: 'Enviar E-mail',
    color: '#3b82f6',
    gradient: '#3b82f6',
  },
  delay: {
    label: 'Aguardar',
    color: '#7c3aed',
    gradient: '#7c3aed',
  },
  condition: {
    label: 'Condicao',
    color: '#7c3aed',
    gradient: '#7c3aed',
  },
  criar_cashback: {
    label: 'Criar Cashback',
    color: '#f59e0b',
    gradient: '#f59e0b',
  },
  default: {
    label: 'Acao',
    color: '#7c3aed',
    gradient: '#7c3aed',
  },
}

const currentConfig = computed(() => {
  return nodeTypeConfig[props.type] || nodeTypeConfig.default
})

const nodeTypeClass = computed(() => `node-type-${props.type || 'default'}`)
const nodeTypeLabel = computed(() => currentConfig.value.label)

// Validation status
const isValid = computed(() => {
  // Check data.valid flag if present
  if (props.data?.valid !== undefined) {
    return props.data.valid
  }
  // Default check based on node type
  const config = props.data?.config
  if (!config) return false

  switch (props.type) {
    case 'send_sms':
    case 'send_whatsapp':
      return config.origem === 'template' ? Boolean(config.template_id) : Boolean(config.mensagem)
    case 'send_email':
      return config.origem === 'template' ? Boolean(config.template_id) : Boolean(config.assunto && config.mensagem_html)
    case 'delay':
      return Boolean(config.tipo && config.valor > 0)
    case 'condition':
      // Allow empty value for initial state, or validate if value exists
      const hasValue = config.condicao?.value !== undefined &&
                       config.condicao?.value !== null &&
                       config.condicao?.value !== ''

      return Boolean(
        config.nome &&
        config.condicao?.field &&
        config.condicao?.operator &&
        (hasValue || (!config.condicao?.value && !config.condicao?.operator))
      )
    case 'criar_cashback':
      return Boolean(
        config.desconto_max_percentual !== null &&
        config.desconto_max_percentual !== undefined &&
        config.cashback_percentual !== null &&
        config.cashback_percentual !== undefined &&
        config.dias_inicio !== null &&
        config.dias_inicio !== undefined &&
        config.dias_vencimento !== null &&
        config.dias_vencimento !== undefined &&
        config.dias_vencimento > config.dias_inicio
      )
    default:
      return true
  }
})

// Error message
const errorMessage = computed(() => {
  if (props.data?.errors && props.data.errors.length > 0) {
    return props.data.errors[0]
  }
  if (!isValid.value) {
    return 'Configuracao incompleta'
  }
  return ''
})

// Icons for each node type
const nodeIcon = computed(() => {
  const icons = {
    send_sms: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2
    }, [
      h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ]),
    send_whatsapp: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor'
    }, [
      h('path', { d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' })
    ]),
    send_email: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2
    }, [
      h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      h('polyline', { points: '22,6 12,13 2,6' })
    ]),
    delay: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2
    }, [
      h('circle', { cx: 12, cy: 12, r: 10 }),
      h('polyline', { points: '12 6 12 12 16 14' })
    ]),
    condition: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    }, [
      h('circle', { cx: 12, cy: 3, r: 2, fill: 'currentColor' }),
      h('path', { d: 'M12 5v7' }),
      h('path', { d: 'M12 12h-6v6' }),
      h('path', { d: 'M12 12h6v6' }),
      h('circle', { cx: 6, cy: 20, r: 2, fill: 'currentColor' }),
      h('circle', { cx: 18, cy: 20, r: 2, fill: 'currentColor' })
    ]),
    criar_cashback: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2
    }, [
      h('line', { x1: 12, y1: 1, x2: 12, y2: 23 }),
      h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ]),
    default: () => h('svg', {
      width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2
    }, [
      h('circle', { cx: 12, cy: 12, r: 10 }),
      h('line', { x1: 12, y1: 8, x2: 12, y2: 16 }),
      h('line', { x1: 8, y1: 12, x2: 16, y2: 12 })
    ]),
  }
  return icons[props.type] || icons.default
})

// Config summary component based on node type
const configSummary = computed(() => {
  const config = props.data?.config

  // No config - show placeholder
  if (!config || Object.keys(config).length === 0) {
    return () => h('div', { class: 'summary-placeholder' }, 'Clique para configurar')
  }

  switch (props.type) {
    case 'send_sms':
    case 'send_whatsapp':
      // Show template name and preview
      if (config.template_id && config.template_nome) {
        return () => h('div', { class: 'summary-content sms-summary' }, [
          h('div', { class: 'sms-template-name' }, config.template_nome),
          config.template_conteudo
            ? h('div', { class: 'sms-template-preview' }, truncateText(config.template_conteudo, 60))
            : null,
          props.type === 'send_whatsapp' && config.media_url
            ? h('div', { class: 'summary-tag' }, 'Com mídia')
            : null,
        ])
      }
      return () => h('div', { class: 'summary-placeholder' }, 'Clique para configurar')

    case 'send_email':
      // Show template name and preview
      if (config.template_id && config.template_nome) {
        return () => h('div', { class: 'summary-content sms-summary' }, [
          h('div', { class: 'sms-template-name' }, config.template_nome),
          config.template_conteudo
            ? h('div', { class: 'sms-template-preview' }, truncateText(config.template_conteudo, 60))
            : null,
        ])
      }
      return () => h('div', { class: 'summary-placeholder' }, 'Clique para configurar')

    case 'delay':
      // Only show summary if we have both valor and tipo configured
      if (config.valor > 0 && config.tipo) {
        // Map unit types to Portuguese labels
        const unitMap = {
          'minutes': config.valor === 1 ? 'minuto' : 'minutos',
          'hours': config.valor === 1 ? 'hora' : 'horas',
          'days': config.valor === 1 ? 'dia' : 'dias',
          'weeks': config.valor === 1 ? 'semana' : 'semanas',
          'months': config.valor === 1 ? 'mês' : 'meses',
          // Legacy support
          'minutos': config.valor === 1 ? 'minuto' : 'minutos',
          'horas': config.valor === 1 ? 'hora' : 'horas',
          'dias': config.valor === 1 ? 'dia' : 'dias',
        }

        const children = [
          h('div', { class: 'delay-main' }, `Aguardar ${config.valor} ${unitMap[config.tipo] || config.tipo}`)
        ]

        // Add specific time if configured
        if (config.delay_until_time && config.specific_time) {
          children.push(
            h('div', { class: 'delay-detail' }, `${config.specific_time}`)
          )
        }

        // Add specific days if configured
        if (config.delay_until_days && config.specific_days?.length > 0) {
          children.push(
            h('div', { class: 'delay-detail' }, config.specific_days.join(', '))
          )
        }

        return () => h('div', { class: 'summary-content delay-summary' }, children)
      }
      return () => h('div', { class: 'summary-placeholder' }, 'Clique para configurar')

    case 'condition':
      if (config.condicao?.field && config.condicao?.operator && config.condicao?.value !== undefined) {
        // Field labels map - v2 atualizado com segmentação e dados demográficos
        const fieldLabels = {
          // Pedido
          'pedido.valor': 'Valor',
          'pedido.quantidade_itens': 'Qtd. Itens',
          'pedido.status_flash': 'Status',
          'pedido.cupom': 'Cupom',
          'pedido.loja_id': 'Loja',
          // Cashback
          'cashback.valor': 'Cashback',
          'cashback.status': 'Status CB',
          'cashback.compra_minima': 'Mín. CB',
          // Cliente
          'cliente.total_pedidos': 'Total Pedidos',
          'cliente.valor_total_gasto': 'Total Gasto',
          'cliente.ticket_medio': 'Ticket Médio',
          'cliente.dias_desde_ultimo_pedido': 'Dias Ult. Pedido',
          'cliente.segmento_id': 'Segmento',
          'cliente.genero': 'Gênero',
          'cliente.idade': 'Idade',
          'cliente.estado': 'Estado',
          'cliente.cidade': 'Cidade',
          // Produto
          'produto.nome': 'Produto',
          'produto.categoria_nome': 'Categoria',
          // Variação
          'variacao.cor': 'Cor',
          'variacao.tamanho': 'Tamanho',
        }

        // Operator labels map - v2 com todos os operadores
        const operatorLabels = {
          '>=': '≥',
          '<=': '≤',
          '=': '=',
          '!=': '≠',
          'between': 'entre',
          'contains': 'contém',
          'not_contains': 'não contém',
          'in': 'em',
          'not_in': 'não em',
        }

        // Format value based on field type
        const currencyFields = [
          'pedido.valor',
          'cashback.valor', 'cashback.compra_minima',
          'cliente.valor_total_gasto', 'cliente.ticket_medio'
        ]

        const isCurrency = currencyFields.includes(config.condicao.field)

        // Get store name from collection
        const getLojaName = (lojaId) => {
          try {
            const collections = wwLib.$store.getters['data/getCollections']
            const lojas = collections?.['32ba8d7c-0932-4ac0-a13b-185374585a92']?.data
            if (Array.isArray(lojas)) {
              const loja = lojas.find(l => l.id === lojaId)
              return loja?.nome || `Loja #${lojaId}`
            }
          } catch (e) {}
          return `Loja #${lojaId}`
        }

        // Get segment name from collection
        const getSegmentoName = (segmentoId) => {
          try {
            const collections = wwLib.$store.getters['data/getCollections']
            const segmentos = collections?.['c9c9e7d6-3473-45ef-ac30-3ec128ca3d31']?.data
            if (Array.isArray(segmentos)) {
              const segmento = segmentos.find(s => s.id === segmentoId)
              return segmento?.nome || `Segmento #${segmentoId}`
            }
          } catch (e) {}
          return `Segmento #${segmentoId}`
        }

        const formatValue = (val) => {
          // Handle loja field specially
          if (config.condicao.field === 'pedido.loja_id') {
            return getLojaName(val)
          } else if (config.condicao.field === 'cliente.segmento_id') {
            return getSegmentoName(val)
          } else if (isCurrency && typeof val === 'number') {
            return `R$ ${Number(val).toFixed(2).replace('.', ',')}`
          } else if (typeof val === 'boolean' || val === 'true' || val === 'false') {
            return (val === true || val === 'true') ? 'sim' : 'não'
          } else {
            return truncateText(String(val), 20)
          }
        }

        const fieldLabel = fieldLabels[config.condicao.field] || config.condicao.field
        const operatorLabel = operatorLabels[config.condicao.operator] || config.condicao.operator

        // Handle between operator
        let displayText
        if (config.condicao.operator === 'between') {
          const formattedValue1 = formatValue(config.condicao.value)
          const formattedValue2 = formatValue(config.condicao.value2)
          displayText = `${fieldLabel} entre ${formattedValue1} e ${formattedValue2}`
        } else {
          const formattedValue = formatValue(config.condicao.value)
          displayText = `${fieldLabel} ${operatorLabel} ${formattedValue}`
        }

        return () => h('div', { class: 'summary-content condition-summary' }, [
          h('div', { class: 'condition-main' }, displayText),
        ])
      }
      return () => h('div', { class: 'summary-placeholder' }, 'Clique para configurar')

    case 'criar_cashback':
      if (config.cashback_percentual !== null && config.cashback_percentual !== undefined) {
        return () => h('div', { class: ['summary-content', 'cashback-summary'] }, [
          // Info section - like "Quando:"
          h('div', { class: 'node-info' }, [
            h('span', { class: 'info-label' }, 'Configuração:'),
            h('span', { class: 'info-value' }, 'Cashback automático'),
          ]),
          // Status pills - like trigger's status pills
          h('div', { class: 'status-pills' }, [
            h('span', { class: ['status-pill', 'cashback-main'] },
              `${config.cashback_percentual}% de cashback`
            ),
            h('span', { class: ['status-pill', 'cashback-secondary'] },
              `até ${config.desconto_max_percentual || 0}% desc.`
            ),
          ]),
          // Additional info pills
          h('div', { class: 'status-pills', style: 'margin-top: 6px;' }, [
            h('span', { class: ['status-pill', 'cashback-info'] },
              config.dias_inicio === 0 ? 'Ativo imediatamente' : `Ativa em ${config.dias_inicio} dias`
            ),
            h('span', { class: ['status-pill', 'cashback-info'] },
              `Válido por ${config.dias_vencimento || 0} dias`
            ),
          ]),
        ])
      }
      return () => h('div', { class: 'summary-placeholder' }, 'Clique para configurar')

    default:
      return () => h('div', { class: 'summary-placeholder' }, 'Configurar')
  }
})

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Handle add node button click
const handleAddNode = () => {
  emit('add-node', {
    sourceNodeId: props.id,
    sourceNodeType: props.type,
    position: Position.Bottom,
  })
}

// Three-dot menu handlers
const toggleMenu = (event) => {
  event.stopPropagation()
  showMenu.value = !showMenu.value
}

const handleDelete = (event) => {
  event.stopPropagation()
  showMenu.value = false
  emit('delete-node', props.id)
}
</script>

<style scoped>
.action-node {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0;
  width: 280px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.15s ease;
}

/* Node type variations - clean design with minimal color */
.node-type-send_sms {
  --node-color: #10b981;
  --node-bg: #f0fdf4;
}

.node-type-send_whatsapp {
  --node-color: #10b981;
  --node-bg: #f0fdf4;
}

.node-type-send_email {
  --node-color: #3b82f6;
  --node-bg: #eff6ff;
}

.node-type-delay {
  --node-color: #7c3aed;
  --node-bg: #faf5ff;
}

.node-type-condition {
  --node-color: #7c3aed;
  --node-bg: #faf5ff;
}

.node-type-criar_cashback {
  --node-color: #f59e0b;
  --node-bg: #fffbeb;
}

.node-type-default {
  --node-color: #7c3aed;
  --node-bg: #f9f9f9;
}

.action-node:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.action-node.selected {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.action-node.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.action-node.invalid.selected {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Three-Dot Menu */
.node-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
}

.menu-button {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
}

.menu-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 140px;
  overflow: hidden;
  z-index: 1000;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: none;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item svg {
  flex-shrink: 0;
}

.menu-item-delete {
  color: #dc2626;
}

.menu-item-delete:hover {
  background: #fef2f2;
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
  color: var(--node-color, #6b7280);
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

/* Config Summary Styles - Using :deep() for dynamic content */
.config-summary {
  min-height: 32px;
}

:deep(.summary-placeholder) {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

:deep(.summary-content) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.summary-row) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

:deep(.summary-label) {
  color: #6b7280;
  flex-shrink: 0;
  font-size: 11px;
}

:deep(.summary-value) {
  color: #374151;
  font-weight: 500;
}

:deep(.summary-truncate) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

:deep(.summary-tag) {
  display: inline-block;
  padding: 3px 8px;
  background: var(--node-bg, #f9f9f9);
  border-radius: 4px;
  font-size: 11px;
  color: var(--node-color, #6b7280);
  margin-top: 4px;
  font-weight: 500;
}

/* SMS/WhatsApp Summary - Using :deep() for dynamic content */
:deep(.sms-summary) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.sms-template-name) {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.3;
  word-break: break-word;
}

:deep(.sms-template-preview) {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
  word-break: break-word;
}

/* Delay Summary - Using :deep() for dynamic content */
:deep(.delay-summary) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.delay-main) {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.3;
}

:deep(.delay-detail) {
  font-size: 11px;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.3;
}

/* Condition Summary - Using :deep() for dynamic content */
:deep(.condition-summary) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.condition-main) {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
}

:deep(.condition-name) {
  font-size: 11px;
  color: #6b7280;
}

.action-true,
.action-false {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.action-true {
  background: #f9f9f9;
  border: 1px solid #7c3aed;
  color: #7c3aed;
}

.action-false {
  background: #fef2f2;
  border: 1px solid #ef4444;
  color: #ef4444;
}

/* Node Info (shared with Trigger) - Using :deep() for dynamic content */
:deep(.node-info) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

:deep(.info-label) {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

:deep(.info-value) {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

/* Status Pills (shared with Trigger) - Using :deep() for dynamic content */
:deep(.status-pills) {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

:deep(.status-pill) {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

:deep(.status-pill.from) {
  background: #f9f9f9;
  border: 1px solid #d1d5db;
  color: #6b7280;
}

:deep(.status-pill.to) {
  background: #f9f9f9;
  border: 1px solid #7c3aed;
  color: #7c3aed;
}

:deep(.status-pill.unconfigured) {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-style: italic;
}

/* Cashback Summary - Using :deep() for dynamic content */
:deep(.cashback-summary) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Cashback-specific pills - Using :deep() for dynamic content */
:deep(.status-pill.cashback-main) {
  background: #f9f9f9;
  border: 1px solid #7c3aed;
  color: #7c3aed;
}

:deep(.status-pill.cashback-secondary) {
  background: #f9f9f9;
  border: 1px solid #d1d5db;
  color: #6b7280;
}

:deep(.status-pill.cashback-info) {
  background: #f9f9f9;
  border: 1px solid #e5e7eb;
  color: #374151;
  font-size: 10px;
}

:deep(.status-arrow) {
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
.target-handle {
  width: 10px !important;
  height: 10px !important;
  background: transparent !important;
  border: none !important;
  top: -5px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  opacity: 0;
}

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

</style>
