<template>
  <div class="config-form">
    <!-- Field Selection -->
    <div class="form-group">
      <label class="form-label">
        Campo:
        <span class="required">*</span>
      </label>
      <select
        v-model="localConfig.condicao.field"
        class="form-select"
        :class="{ error: !localConfig.condicao.field }"
        @change="handleFieldChange"
      >
        <option value="">Selecione um campo...</option>
        <optgroup
          v-for="category in categories"
          :key="category.key"
          :label="category.label"
        >
          <option
            v-for="field in getFieldsByCategory(category.key)"
            :key="field.value"
            :value="field.value"
          >
            {{ field.label }}
          </option>
        </optgroup>
      </select>
      <p v-if="selectedField" class="form-help">
        {{ selectedField.description }}
      </p>
    </div>

    <!-- Operator Selection -->
    <div v-if="localConfig.condicao.field" class="form-group">
      <label class="form-label">
        Operador:
        <span class="required">*</span>
      </label>
      <select
        v-model="localConfig.condicao.operator"
        class="form-select"
        :class="{ error: !localConfig.condicao.operator }"
      >
        <option value="">Selecione...</option>
        <option
          v-for="op in availableOperators"
          :key="op.value"
          :value="op.value"
        >
          {{ op.label }}
        </option>
      </select>
    </div>

    <!-- Value Input - Between Operator -->
    <template v-if="localConfig.condicao.field && isBetweenOperator">
      <div class="form-group">
        <label class="form-label">
          Valor Mínimo:
          <span class="required">*</span>
        </label>
        <input
          type="text"
          inputmode="decimal"
          :value="formatInputValue(localConfig.condicao.value)"
          @input="handleNumberInput($event, 'value')"
          @keypress="allowOnlyNumbers"
          class="form-input"
          :class="{ error: localConfig.condicao.value === null || localConfig.condicao.value === '' }"
          placeholder="Ex: 100,00"
        />
      </div>
      <div class="form-group">
        <label class="form-label">
          Valor Máximo:
          <span class="required">*</span>
        </label>
        <input
          type="text"
          inputmode="decimal"
          :value="formatInputValue(localConfig.condicao.value2)"
          @input="handleNumberInput($event, 'value2')"
          @keypress="allowOnlyNumbers"
          class="form-input"
          :class="{ error: localConfig.condicao.value2 === null || localConfig.condicao.value2 === '' }"
          placeholder="Ex: 500,00"
        />
        <p v-if="selectedField" class="form-help">
          {{ getValueTypeHint() }}
        </p>
      </div>
    </template>

    <!-- Value Input - Other Operators -->
    <div v-else-if="localConfig.condicao.field && localConfig.condicao.operator" class="form-group">
      <label class="form-label">
        {{ getValueLabel }}
        <span class="required">*</span>
      </label>

      <!-- Enum Select -->
      <select
        v-if="selectedField?.valueType === 'enum'"
        v-model="localConfig.condicao.value"
        class="form-select"
        :class="{ error: !localConfig.condicao.value }"
      >
        <option value="">{{ selectedField.placeholder }}</option>
        <option
          v-for="enumValue in selectedField.enumValues"
          :key="enumValue"
          :value="enumValue"
        >
          {{ enumValue }}
        </option>
      </select>

      <!-- Boolean Select -->
      <select
        v-else-if="selectedField?.valueType === 'boolean'"
        v-model="localConfig.condicao.value"
        class="form-select"
        :class="{ error: localConfig.condicao.value === '' }"
      >
        <option value="">Selecione...</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>

      <!-- Date Input -->
      <input
        v-else-if="selectedField?.valueType === 'date'"
        type="date"
        v-model="localConfig.condicao.value"
        class="form-input"
        :class="{ error: !localConfig.condicao.value }"
      />

      <!-- Number Input -->
      <input
        v-else-if="selectedField?.valueType === 'number'"
        type="text"
        inputmode="decimal"
        :value="formatInputValue(localConfig.condicao.value)"
        @input="handleNumberInput($event, 'value')"
        @keypress="allowOnlyNumbers"
        class="form-input"
        :class="{ error: localConfig.condicao.value === null || localConfig.condicao.value === '' }"
        :placeholder="selectedField.placeholder"
      />

      <!-- Loja Select with Search -->
      <div
        v-else-if="localConfig.condicao.field === 'pedido.loja_id'"
        class="searchable-select"
        :class="{ error: !localConfig.condicao.value }"
      >
        <input
          type="text"
          v-model="searchLoja"
          class="search-input"
          placeholder="Buscar loja..."
        />
        <div class="select-options">
          <div
            v-for="loja in filteredLojas"
            :key="loja.id"
            class="select-option"
            :class="{ selected: localConfig.condicao.value === loja.id }"
            @click="selectLoja(loja.id)"
          >
            {{ loja.nome }}
          </div>
          <div v-if="filteredLojas.length === 0" class="select-option no-results">
            Nenhuma loja encontrada
          </div>
        </div>
      </div>

      <!-- Segmento Select with Search -->
      <div
        v-else-if="localConfig.condicao.field === 'cliente.segmento_id'"
        class="searchable-select"
        :class="{ error: !localConfig.condicao.value }"
      >
        <input
          type="text"
          v-model="searchSegmento"
          class="search-input"
          placeholder="Buscar segmento..."
        />
        <div class="select-options">
          <div
            v-for="segmento in filteredSegmentos"
            :key="segmento.id"
            class="select-option"
            :class="{ selected: localConfig.condicao.value === segmento.id }"
            @click="selectSegmento(segmento.id)"
          >
            {{ segmento.nome }}
          </div>
          <div v-if="filteredSegmentos.length === 0" class="select-option no-results">
            Nenhum segmento encontrado
          </div>
        </div>
      </div>

      <!-- String Input -->
      <input
        v-else
        type="text"
        v-model="localConfig.condicao.value"
        class="form-input"
        :class="{ error: !localConfig.condicao.value }"
        :placeholder="selectedField?.placeholder || 'Digite o valor'"
      />

      <p v-if="selectedField" class="form-help">
        {{ getValueTypeHint() }}
      </p>
    </div>

    <!-- Preview -->
    <div class="preview-box">
      <h4 class="preview-title">Preview</h4>
      <div class="preview-content">
        <div class="preview-condition">
          {{ previewConditionText }}
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
})

const emit = defineEmits(['update', 'close'])

const localConfig = ref({
  condicao: {
    field: '',
    operator: '',
    value: '',
    value2: '',
  },
})

// Search states for dropdowns
const searchLoja = ref('')
const searchSegmento = ref('')

// Categorias
const categories = [
  { key: 'pedido', label: '📦 Pedido' },
  { key: 'cashback', label: '💰 Cashback' },
  { key: 'cliente', label: '👤 Cliente' },
  { key: 'produto', label: '🏷️ Produto' },
  { key: 'variacao', label: '🎨 Variação' },
]

// Field metadata conforme guia técnico v2
const fieldMetadata = {
  // ============== PEDIDO ==============
  'pedido.valor': {
    label: 'Valor do Pedido',
    category: 'pedido',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Valor total do pedido em R$',
    placeholder: '100,00'
  },
  'pedido.quantidade_itens': {
    label: 'Quantidade de Itens',
    category: 'pedido',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Número de itens no pedido',
    placeholder: '3'
  },
  'pedido.status_flash': {
    label: 'Status',
    category: 'pedido',
    valueType: 'enum',
    operators: ['=', '!='],
    enumValues: ['created', 'paid', 'shipped', 'delivered', 'canceled'],
    description: 'Status atual do pedido',
    placeholder: 'Selecione o status'
  },
  'pedido.cupom': {
    label: 'Cupom Utilizado',
    category: 'pedido',
    valueType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
    description: 'Código do cupom usado no pedido',
    placeholder: 'NATAL2024'
  },
  'pedido.loja_id': {
    label: 'Loja',
    category: 'pedido',
    valueType: 'loja',
    operators: ['=', '!='],
    description: 'Loja do pedido',
    placeholder: 'Selecione a loja'
  },

  // ============== CASHBACK ==============
  'cashback.valor': {
    label: 'Valor do Cashback',
    category: 'cashback',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Valor do cashback gerado pelo pedido',
    placeholder: '25,00'
  },
  'cashback.status': {
    label: 'Status do Cashback',
    category: 'cashback',
    valueType: 'enum',
    operators: ['=', '!='],
    enumValues: ['ativo', 'criado', 'utilizado', 'cancelado'],
    description: 'Status atual do cashback',
    placeholder: 'Selecione o status'
  },
  'cashback.compra_minima': {
    label: 'Valor Mínimo para Usar',
    category: 'cashback',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Valor mínimo de compra para usar o cashback',
    placeholder: '100,00'
  },

  // ============== CLIENTE ==============
  'cliente.total_pedidos': {
    label: 'Total de Pedidos',
    category: 'cliente',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Total de pedidos realizados pelo cliente',
    placeholder: '5'
  },
  'cliente.valor_total_gasto': {
    label: 'Valor Total Gasto',
    category: 'cliente',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Soma de todos os pedidos do cliente em R$',
    placeholder: '2500,00'
  },
  'cliente.ticket_medio': {
    label: 'Ticket Médio',
    category: 'cliente',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Valor médio dos pedidos do cliente em R$',
    placeholder: '500,00'
  },
  'cliente.dias_desde_ultimo_pedido': {
    label: 'Dias Desde Último Pedido',
    category: 'cliente',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Quantidade de dias desde o último pedido do cliente',
    placeholder: '30'
  },
  'cliente.segmento_id': {
    label: 'Segmento',
    category: 'cliente',
    valueType: 'segmento',
    operators: ['=', '!='],
    description: 'Verifica se o cliente pertence a um segmento',
    placeholder: 'Selecione o segmento'
  },
  'cliente.genero': {
    label: 'Gênero',
    category: 'cliente',
    valueType: 'enum',
    operators: ['=', '!='],
    enumValues: ['masculino', 'feminino', 'outro', 'nao_informado'],
    description: 'Gênero do cliente',
    placeholder: 'Selecione o gênero'
  },
  'cliente.idade': {
    label: 'Idade',
    category: 'cliente',
    valueType: 'number',
    operators: ['>=', '<=', '=', '!=', 'between'],
    description: 'Idade do cliente em anos',
    placeholder: '25'
  },
  'cliente.estado': {
    label: 'Estado',
    category: 'cliente',
    valueType: 'string',
    operators: ['=', '!='],
    description: 'Estado (UF) do cliente',
    placeholder: 'SP'
  },
  'cliente.cidade': {
    label: 'Cidade',
    category: 'cliente',
    valueType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
    description: 'Cidade do cliente',
    placeholder: 'São Paulo'
  },

  // ============== PRODUTO ==============
  'produto.nome': {
    label: 'Nome do Produto',
    category: 'produto',
    valueType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
    description: 'Nome do produto (ANY se múltiplos produtos)',
    placeholder: 'Tênis Air Max'
  },
  'produto.categoria_nome': {
    label: 'Categoria do Produto',
    category: 'produto',
    valueType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
    description: 'Nome da categoria (ANY se múltiplos produtos)',
    placeholder: 'Eletrônicos'
  },

  // ============== VARIAÇÃO ==============
  'variacao.cor': {
    label: 'Cor da Variação',
    category: 'variacao',
    valueType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
    description: 'Cor da variação do produto (ANY)',
    placeholder: 'Preto'
  },
  'variacao.tamanho': {
    label: 'Tamanho da Variação',
    category: 'variacao',
    valueType: 'string',
    operators: ['=', '!=', 'contains', 'not_contains'],
    description: 'Tamanho da variação do produto (ANY)',
    placeholder: 'M'
  },
}

// Operator options
const operatorLabels = {
  '>=': 'Maior ou Igual (≥)',
  '<=': 'Menor ou Igual (≤)',
  '=': 'Igual (=)',
  '!=': 'Diferente (≠)',
  'between': 'Entre',
  'contains': 'Contém',
  'not_contains': 'Não Contém',
  'in': 'Está em',
  'not_in': 'Não está em',
}

// Initialize from props
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    localConfig.value = {
      condicao: {
        field: newConfig.condicao?.field || '',
        operator: newConfig.condicao?.operator || '',
        value: newConfig.condicao?.value ?? '',
        value2: newConfig.condicao?.value2 ?? '',
      },
    }
  }
}, { immediate: true, deep: true })

// Get fields by category
const getFieldsByCategory = (category) => {
  return Object.entries(fieldMetadata)
    .filter(([_, meta]) => meta.category === category)
    .map(([value, meta]) => ({ value, label: meta.label }))
}

// Selected field
const selectedField = computed(() => {
  if (!localConfig.value.condicao.field) return null
  return fieldMetadata[localConfig.value.condicao.field] || null
})

// Available operators for selected field
const availableOperators = computed(() => {
  if (!selectedField.value) return []
  return selectedField.value.operators.map(op => ({
    value: op,
    label: operatorLabels[op] || op
  }))
})

// Get stores from collection
const lojas = computed(() => {
  try {
    const collections = wwLib.$store.getters['data/getCollections']
    const data = collections?.['32ba8d7c-0932-4ac0-a13b-185374585a92']?.data
    return Array.isArray(data) ? data : []
  } catch (e) {
    return []
  }
})

// Get selected store name for display
const selectedLojaName = computed(() => {
  if (!localConfig.value.condicao.value) return ''
  const loja = lojas.value.find(l => l.id === localConfig.value.condicao.value)
  return loja?.nome || ''
})

// Dynamic label based on field type
const getValueLabel = computed(() => {
  const field = localConfig.value.condicao.field
  if (field === 'pedido.loja_id') return 'Loja:'
  if (field === 'cliente.segmento_id') return 'Segmento:'
  return 'Valor:'
})

// Select loja handler
const selectLoja = (lojaId) => {
  localConfig.value.condicao.value = lojaId
}

// Select segmento handler
const selectSegmento = (segmentoId) => {
  localConfig.value.condicao.value = segmentoId
}

// Get segments from collection
const segmentos = computed(() => {
  try {
    const collections = wwLib.$store.getters['data/getCollections']
    const data = collections?.['c9c9e7d6-3473-45ef-ac30-3ec128ca3d31']?.data
    return Array.isArray(data) ? data : []
  } catch (e) {
    return []
  }
})

// Filtered lojas based on search
const filteredLojas = computed(() => {
  if (!searchLoja.value) return lojas.value
  const search = searchLoja.value.toLowerCase()
  return lojas.value.filter(l => l.nome?.toLowerCase().includes(search))
})

// Filtered segmentos based on search
const filteredSegmentos = computed(() => {
  if (!searchSegmento.value) return segmentos.value
  const search = searchSegmento.value.toLowerCase()
  return segmentos.value.filter(s => s.nome?.toLowerCase().includes(search))
})

// Check if field is currency type
const isFieldCurrency = computed(() => {
  const field = localConfig.value.condicao.field
  return field === 'pedido.valor' ||
         field === 'cashback.valor' ||
         field === 'cashback.compra_minima' ||
         field === 'cliente.valor_total_gasto' ||
         field === 'cliente.ticket_medio'
})

// Value type hint
const getValueTypeHint = () => {
  if (!selectedField.value) return ''

  switch (selectedField.value.valueType) {
    case 'number':
      return isFieldCurrency.value ? 'Em reais (R$)' : 'Quantidade'
    case 'string':
      return 'Texto (case-insensitive)'
    case 'boolean':
      return 'Verdadeiro ou falso'
    case 'date':
      return 'Data no formato AAAA-MM-DD'
    case 'enum':
      return 'Selecione um valor da lista'
    default:
      return ''
  }
}

// Preview text
const previewConditionText = computed(() => {
  if (!localConfig.value.condicao.field) {
    return 'Selecione um campo para começar'
  }

  const field = selectedField.value?.label || localConfig.value.condicao.field

  if (!localConfig.value.condicao.operator) {
    return `${field} ...`
  }

  const operator = operatorLabels[localConfig.value.condicao.operator] || localConfig.value.condicao.operator

  // Handle between operator
  if (localConfig.value.condicao.operator === 'between') {
    const hasValue1 = localConfig.value.condicao.value !== '' && localConfig.value.condicao.value !== null
    const hasValue2 = localConfig.value.condicao.value2 !== '' && localConfig.value.condicao.value2 !== null

    let value1 = hasValue1 ? localConfig.value.condicao.value : '[mín]'
    let value2 = hasValue2 ? localConfig.value.condicao.value2 : '[máx]'

    // Format values for currency fields
    if (selectedField.value?.valueType === 'number' && isFieldCurrency.value) {
      if (hasValue1) value1 = `R$ ${Number(value1).toFixed(2).replace('.', ',')}`
      if (hasValue2) value2 = `R$ ${Number(value2).toFixed(2).replace('.', ',')}`
    }

    return `Se ${field} Entre ${value1} e ${value2}`
  }

  if (!localConfig.value.condicao.value && localConfig.value.condicao.value !== 0 && localConfig.value.condicao.value !== false) {
    return `${field} ${operator} [valor]`
  }

  let value = localConfig.value.condicao.value

  // Format value based on type
  if (localConfig.value.condicao.field === 'pedido.loja_id') {
    // Get store name from lojas computed
    const loja = lojas.value.find(l => l.id === value)
    value = loja?.nome || `Loja #${value}`
  } else if (localConfig.value.condicao.field === 'cliente.segmento_id') {
    // Get segment name from segmentos computed
    const segmento = segmentos.value.find(s => s.id === value)
    value = segmento?.nome || `Segmento #${value}`
  } else if (selectedField.value?.valueType === 'number' && isFieldCurrency.value) {
    value = `R$ ${Number(value).toFixed(2).replace('.', ',')}`
  } else if (selectedField.value?.valueType === 'boolean') {
    value = value === 'true' || value === true ? 'verdadeiro' : 'falso'
  }

  return `Se ${field} ${operator} ${value}`
})

const handleFieldChange = () => {
  // Reset operator and value when field changes
  localConfig.value.condicao.operator = ''
  localConfig.value.condicao.value = ''
  localConfig.value.condicao.value2 = ''
}

// Format number for display (with comma)
const formatInputValue = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return String(value).replace('.', ',')
}

// Allow only numbers, comma, and dot on keypress
const allowOnlyNumbers = (event) => {
  const char = String.fromCharCode(event.which || event.keyCode)
  // Allow: numbers, comma, dot, minus
  if (!/[\d,.-]/.test(char)) {
    event.preventDefault()
  }
}

// Handle number input with comma support
const handleNumberInput = (event, field) => {
  let inputValue = event.target.value

  // Remove any non-numeric characters except comma and dot
  const cleanValue = inputValue.replace(/[^\d,.-]/g, '')

  // Update the input display with cleaned value
  if (inputValue !== cleanValue) {
    event.target.value = cleanValue
  }

  // Replace comma with dot for parsing
  const parseValue = cleanValue.replace(',', '.')

  // Parse to number
  const numValue = parseValue === '' ? '' : parseFloat(parseValue)

  if (field === 'value') {
    localConfig.value.condicao.value = isNaN(numValue) ? '' : numValue
  } else if (field === 'value2') {
    localConfig.value.condicao.value2 = isNaN(numValue) ? '' : numValue
  }
}

// Check if operator is between
const isBetweenOperator = computed(() => {
  return localConfig.value.condicao.operator === 'between'
})

// Validation
const isValid = computed(() => {
  const hasField = !!localConfig.value.condicao.field
  const hasOperator = !!localConfig.value.condicao.operator

  if (!hasField || !hasOperator) return false

  // For between operator, require both values
  if (isBetweenOperator.value) {
    const hasValue1 = localConfig.value.condicao.value !== '' && localConfig.value.condicao.value !== null
    const hasValue2 = localConfig.value.condicao.value2 !== '' && localConfig.value.condicao.value2 !== null
    return hasValue1 && hasValue2
  }

  return true
})

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

.form-select.error,
.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

/* Searchable Select */
.searchable-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  overflow: hidden;
}

.searchable-select.error {
  border-color: #ef4444;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #1A1A1A;
  background: #f9fafb;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  background: #ffffff;
  border-bottom-color: #007aff;
}

.search-input::placeholder {
  color: #9ca3af;
}

.select-options {
  max-height: 180px;
  overflow-y: auto;
}

.select-option {
  padding: 8px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.select-option:hover {
  background: #f3f4f6;
}

.select-option.selected {
  background: #ede9fe;
  color: #7c3aed;
  font-weight: 500;
}

.select-option.no-results {
  color: #9ca3af;
  font-style: italic;
  cursor: default;
}

.select-option.no-results:hover {
  background: transparent;
}

/* Section Divider */
.section-divider {
  margin: 8px 0;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 4px 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
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
  gap: 12px;
}

.preview-condition {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #7c3aed;
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
