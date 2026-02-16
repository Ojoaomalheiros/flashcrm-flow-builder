/**
 * Valida a estrutura geral do fluxo
 * @param {Array} nodes - Array de nodes do fluxo
 * @param {Array} edges - Array de conexões entre nodes
 * @returns {boolean}
 */
export function validateFlowStructure(nodes, edges) {
  // Deve ter pelo menos um trigger node
  const hasTrigger = nodes.some(node => node.type === 'trigger')
  if (!hasTrigger) {
    return false
  }

  // Deve ter pelo menos um trigger node
  if (nodes.length === 0) {
    return false
  }

  // Todos os nodes (exceto trigger) devem estar conectados
  for (const node of nodes) {
    if (node.type === 'trigger') continue

    const hasIncomingEdge = edges.some(edge => edge.target === node.id)
    if (!hasIncomingEdge) {
      return false // node desconectado
    }
  }

  // Não pode haver ciclos (fluxo deve ser DAG - Directed Acyclic Graph)
  if (hasCycle(nodes, edges)) {
    return false
  }

  return true
}

/**
 * Detecta ciclos no grafo
 */
function hasCycle(nodes, edges) {
  const visited = new Set()
  const recursionStack = new Set()

  function dfs(nodeId) {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const outgoingEdges = edges.filter(edge => edge.source === nodeId)
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true
      } else if (recursionStack.has(edge.target)) {
        return true // ciclo detectado
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true
    }
  }

  return false
}

/**
 * Valida configuração de um node específico
 * @param {string} type - Tipo do node
 * @param {Object} config - Configuração do node
 * @returns {Object} Resultado da validação
 */
export function validateNodeConfig(type, config) {
  const errors = []

  switch (type) {
    case 'trigger':
      return validateTriggerConfig(config)
    case 'send_sms':
      return validateSendSMSConfig(config)
    case 'send_whatsapp':
      return validateSendWhatsAppConfig(config)
    case 'send_email':
      return validateSendEmailConfig(config)
    case 'delay':
      return validateDelayConfig(config)
    case 'condition':
      return validateConditionConfig(config)
    case 'criar_cashback':
      return validateCriarCashbackConfig(config)
    case 'conditional_branch':
      // Conditional branch nodes (Sim/Não) don't need config validation
      // They are auxiliary nodes created automatically with condition nodes
      return { valid: true, errors: [] }
    default:
      errors.push({
        field: 'type',
        message: 'Tipo de node inválido',
        code: 'INVALID_NODE_TYPE',
      })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Trigger Config
 */
function validateTriggerConfig(config) {
  const errors = []

  if (!config.trigger_tipo) {
    errors.push({
      field: 'trigger_tipo',
      message: 'Tipo de gatilho nao selecionado',
      code: 'REQUIRED_FIELD',
    })
    return { valid: false, errors }
  }

  // carrinho_abandonado needs no additional config
  if (config.trigger_tipo === 'carrinho_abandonado') {
    return { valid: true, errors: [] }
  }

  // order_status_change validation
  if (!config.status_to) {
    errors.push({
      field: 'status_to',
      message: 'Status de destino e obrigatorio',
      code: 'REQUIRED_FIELD',
    })
  }

  if (config.status_from && config.status_to && config.status_from === config.status_to) {
    errors.push({
      field: 'status_from',
      message: 'Status de origem nao pode ser igual ao de destino',
      code: 'INVALID_VALUE',
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Send SMS Config
 */
function validateSendSMSConfig(config) {
  const errors = []

  if (config.origem === 'template') {
    if (!config.template_id) {
      errors.push({
        field: 'template_id',
        message: 'Template é obrigatório quando origem é template',
        code: 'REQUIRED_FIELD',
      })
    }
  } else if (config.origem === 'custom') {
    if (!config.mensagem || config.mensagem.trim() === '') {
      errors.push({
        field: 'mensagem',
        message: 'Mensagem é obrigatória quando origem é custom',
        code: 'REQUIRED_FIELD',
      })
    }

    if (config.mensagem && config.mensagem.length > 160) {
      errors.push({
        field: 'mensagem',
        message: 'Mensagem SMS não pode ter mais de 160 caracteres',
        code: 'MAX_LENGTH',
      })
    }
  } else {
    errors.push({
      field: 'origem',
      message: 'Origem deve ser template ou custom',
      code: 'REQUIRED_FIELD',
    })
  }

  // Valida variáveis
  if (config.mensagem) {
    const variables = extractVariables(config.mensagem)
    for (const variable of variables) {
      if (!config.variaveis || !config.variaveis[variable]) {
        errors.push({
          field: 'variaveis',
          message: `Variável ${variable} não mapeada`,
          code: 'UNMAPPED_VARIABLE',
        })
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Send WhatsApp Config
 */
function validateSendWhatsAppConfig(config) {
  const errors = []

  if (config.origem === 'template') {
    if (!config.template_id) {
      errors.push({
        field: 'template_id',
        message: 'Template é obrigatório quando origem é template',
        code: 'REQUIRED_FIELD',
      })
    }
  } else if (config.origem === 'custom') {
    if (!config.mensagem || config.mensagem.trim() === '') {
      errors.push({
        field: 'mensagem',
        message: 'Mensagem é obrigatória quando origem é custom',
        code: 'REQUIRED_FIELD',
      })
    }
  } else {
    errors.push({
      field: 'origem',
      message: 'Origem deve ser template ou custom',
      code: 'REQUIRED_FIELD',
    })
  }

  // Valida URL da mídia (se fornecida)
  if (config.media_url) {
    try {
      new URL(config.media_url)
    } catch {
      errors.push({
        field: 'media_url',
        message: 'URL da mídia inválida',
        code: 'INVALID_URL',
      })
    }
  }

  // Valida variáveis
  if (config.mensagem) {
    const variables = extractVariables(config.mensagem)
    for (const variable of variables) {
      if (!config.variaveis || !config.variaveis[variable]) {
        errors.push({
          field: 'variaveis',
          message: `Variável ${variable} não mapeada`,
          code: 'UNMAPPED_VARIABLE',
        })
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Send Email Config
 */
function validateSendEmailConfig(config) {
  const errors = []

  if (config.origem === 'template') {
    if (!config.template_id) {
      errors.push({
        field: 'template_id',
        message: 'Template é obrigatório quando origem é template',
        code: 'REQUIRED_FIELD',
      })
    }
  } else if (config.origem === 'custom') {
    if (!config.assunto || config.assunto.trim() === '') {
      errors.push({
        field: 'assunto',
        message: 'Assunto é obrigatório quando origem é custom',
        code: 'REQUIRED_FIELD',
      })
    }

    if (!config.mensagem_html || config.mensagem_html.trim() === '') {
      errors.push({
        field: 'mensagem_html',
        message: 'Mensagem HTML é obrigatória quando origem é custom',
        code: 'REQUIRED_FIELD',
      })
    }
  } else {
    errors.push({
      field: 'origem',
      message: 'Origem deve ser template ou custom',
      code: 'REQUIRED_FIELD',
    })
  }

  // Valida email do remetente (se fornecido)
  if (config.de_email && !isValidEmail(config.de_email)) {
    errors.push({
      field: 'de_email',
      message: 'Email do remetente inválido',
      code: 'INVALID_EMAIL',
    })
  }

  // Valida variáveis
  const content = config.mensagem_html || ''
  const variables = extractVariables(content)
  for (const variable of variables) {
    if (!config.variaveis || !config.variaveis[variable]) {
      errors.push({
        field: 'variaveis',
        message: `Variável ${variable} não mapeada`,
        code: 'UNMAPPED_VARIABLE',
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Delay Config
 */
function validateDelayConfig(config) {
  const errors = []

  // Empty config is invalid - node must be configured
  if (!config.tipo) {
    errors.push({
      field: 'tipo',
      message: 'Tipo de delay é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  }

  // Accept both English and Portuguese values (including legacy)
  const validTypes = ['minutes', 'hours', 'days', 'weeks', 'months', 'minutos', 'horas', 'dias']
  if (config.tipo && !validTypes.includes(config.tipo)) {
    errors.push({
      field: 'tipo',
      message: 'Tipo de delay inválido',
      code: 'INVALID_VALUE',
    })
  }

  if (!config.valor || config.valor <= 0) {
    errors.push({
      field: 'valor',
      message: 'Valor do delay deve ser maior que zero',
      code: 'INVALID_VALUE',
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Condition Config
 */
function validateConditionConfig(config) {
  const errors = []

  // Validar condição
  if (!config.condicao) {
    errors.push({
      field: 'condicao',
      message: 'Condição é obrigatória',
      code: 'REQUIRED_FIELD',
    })
    return { valid: false, errors }
  }

  // Validar field - v2 com campos reduzidos + segmentação + dados demográficos
  const validFields = [
    // Pedido (5)
    'pedido.valor', 'pedido.quantidade_itens',
    'pedido.status_flash', 'pedido.cupom', 'pedido.loja_id',
    // Cashback (3)
    'cashback.valor', 'cashback.status', 'cashback.compra_minima',
    // Cliente (9)
    'cliente.total_pedidos', 'cliente.valor_total_gasto',
    'cliente.ticket_medio', 'cliente.dias_desde_ultimo_pedido',
    'cliente.segmento_id', 'cliente.genero', 'cliente.idade',
    'cliente.estado', 'cliente.cidade',
    // Produto (2)
    'produto.nome', 'produto.categoria_nome',
    // Variação (2)
    'variacao.cor', 'variacao.tamanho'
  ]

  if (!config.condicao.field) {
    errors.push({
      field: 'condicao.field',
      message: 'Campo é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  } else if (!validFields.includes(config.condicao.field)) {
    errors.push({
      field: 'condicao.field',
      message: 'Campo inválido',
      code: 'INVALID_VALUE',
    })
  }

  // Validar operator - v2 com operadores (sem < e >, com between)
  const validOperators = [
    '>=', '<=', '=', '!=', 'between',
    'contains', 'not_contains', 'in', 'not_in'
  ]

  if (!config.condicao.operator) {
    errors.push({
      field: 'condicao.operator',
      message: 'Operador é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  } else if (!validOperators.includes(config.condicao.operator)) {
    errors.push({
      field: 'condicao.operator',
      message: 'Operador inválido',
      code: 'INVALID_VALUE',
    })
  }

  // Validar value
  if (config.condicao.operator === 'between') {
    // Between operator requires two values
    if (config.condicao.value === null || config.condicao.value === undefined || config.condicao.value === '') {
      errors.push({
        field: 'condicao.value',
        message: 'Valor mínimo é obrigatório',
        code: 'REQUIRED_FIELD',
      })
    }
    if (config.condicao.value2 === null || config.condicao.value2 === undefined || config.condicao.value2 === '') {
      errors.push({
        field: 'condicao.value2',
        message: 'Valor máximo é obrigatório',
        code: 'REQUIRED_FIELD',
      })
    }
    // Validate that value2 > value
    if (
      config.condicao.value !== null && config.condicao.value !== undefined && config.condicao.value !== '' &&
      config.condicao.value2 !== null && config.condicao.value2 !== undefined && config.condicao.value2 !== '' &&
      Number(config.condicao.value2) <= Number(config.condicao.value)
    ) {
      errors.push({
        field: 'condicao.value2',
        message: 'Valor máximo deve ser maior que o mínimo',
        code: 'INVALID_VALUE',
      })
    }
  } else if (config.condicao.value === null || config.condicao.value === undefined || config.condicao.value === '') {
    errors.push({
      field: 'condicao.value',
      message: 'Valor é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  }

  // Validações específicas por tipo de campo
  const numberFields = [
    'pedido.valor', 'pedido.quantidade_itens',
    'cashback.valor', 'cashback.compra_minima',
    'cliente.total_pedidos', 'cliente.valor_total_gasto',
    'cliente.ticket_medio', 'cliente.dias_desde_ultimo_pedido',
    'cliente.idade'
  ]

  const integerFields = [
    'pedido.quantidade_itens',
    'cliente.total_pedidos', 'cliente.dias_desde_ultimo_pedido',
    'cliente.idade'
  ]

  // Fields that use dropdown selects with collection IDs (not numeric validation)
  const selectFields = [
    'pedido.loja_id',
    'cliente.segmento_id'
  ]

  // Validar campos numéricos
  if (numberFields.includes(config.condicao.field)) {
    if (typeof config.condicao.value !== 'number') {
      errors.push({
        field: 'condicao.value',
        message: 'Valor deve ser numérico',
        code: 'INVALID_VALUE',
      })
    } else if (config.condicao.value < 0) {
      errors.push({
        field: 'condicao.value',
        message: 'Valor não pode ser negativo',
        code: 'INVALID_VALUE',
      })
    }

    // Validar inteiros
    if (integerFields.includes(config.condicao.field) && !Number.isInteger(config.condicao.value)) {
      errors.push({
        field: 'condicao.value',
        message: 'Valor deve ser um número inteiro',
        code: 'INVALID_VALUE',
      })
    }
  }

  // Validar campos de seleção (loja, segmento) - requerem valor selecionado
  if (selectFields.includes(config.condicao.field)) {
    if (!config.condicao.value) {
      errors.push({
        field: 'condicao.value',
        message: 'Selecione um valor',
        code: 'MISSING_VALUE',
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida Criar Cashback Config
 */
function validateCriarCashbackConfig(config) {
  const errors = []

  // Validar desconto_max_percentual
  if (config.desconto_max_percentual === null || config.desconto_max_percentual === undefined) {
    errors.push({
      field: 'desconto_max_percentual',
      message: 'Desconto máximo percentual é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  } else if (typeof config.desconto_max_percentual !== 'number') {
    errors.push({
      field: 'desconto_max_percentual',
      message: 'Desconto máximo percentual deve ser um número',
      code: 'INVALID_VALUE',
    })
  } else if (config.desconto_max_percentual < 0 || config.desconto_max_percentual > 100) {
    errors.push({
      field: 'desconto_max_percentual',
      message: 'Desconto máximo percentual deve estar entre 0 e 100',
      code: 'INVALID_VALUE',
    })
  } else if (!Number.isInteger(config.desconto_max_percentual)) {
    errors.push({
      field: 'desconto_max_percentual',
      message: 'Desconto máximo percentual deve ser um número inteiro',
      code: 'INVALID_VALUE',
    })
  }

  // Validar cashback_percentual
  if (config.cashback_percentual === null || config.cashback_percentual === undefined) {
    errors.push({
      field: 'cashback_percentual',
      message: 'Cashback percentual é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  } else if (typeof config.cashback_percentual !== 'number') {
    errors.push({
      field: 'cashback_percentual',
      message: 'Cashback percentual deve ser um número',
      code: 'INVALID_VALUE',
    })
  } else if (config.cashback_percentual < 0 || config.cashback_percentual > 100) {
    errors.push({
      field: 'cashback_percentual',
      message: 'Cashback percentual deve estar entre 0 e 100',
      code: 'INVALID_VALUE',
    })
  } else if (!Number.isInteger(config.cashback_percentual)) {
    errors.push({
      field: 'cashback_percentual',
      message: 'Cashback percentual deve ser um número inteiro',
      code: 'INVALID_VALUE',
    })
  }

  // Validar dias_inicio
  if (config.dias_inicio === null || config.dias_inicio === undefined) {
    errors.push({
      field: 'dias_inicio',
      message: 'Dias para ativação é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  } else if (typeof config.dias_inicio !== 'number') {
    errors.push({
      field: 'dias_inicio',
      message: 'Dias para ativação deve ser um número',
      code: 'INVALID_VALUE',
    })
  } else if (config.dias_inicio < 0 || config.dias_inicio > 365) {
    errors.push({
      field: 'dias_inicio',
      message: 'Dias para ativação deve estar entre 0 e 365',
      code: 'INVALID_VALUE',
    })
  } else if (!Number.isInteger(config.dias_inicio)) {
    errors.push({
      field: 'dias_inicio',
      message: 'Dias para ativação deve ser um número inteiro',
      code: 'INVALID_VALUE',
    })
  }

  // Validar dias_vencimento
  if (config.dias_vencimento === null || config.dias_vencimento === undefined) {
    errors.push({
      field: 'dias_vencimento',
      message: 'Dias para vencimento é obrigatório',
      code: 'REQUIRED_FIELD',
    })
  } else if (typeof config.dias_vencimento !== 'number') {
    errors.push({
      field: 'dias_vencimento',
      message: 'Dias para vencimento deve ser um número',
      code: 'INVALID_VALUE',
    })
  } else if (config.dias_vencimento < 1 || config.dias_vencimento > 365) {
    errors.push({
      field: 'dias_vencimento',
      message: 'Dias para vencimento deve estar entre 1 e 365',
      code: 'INVALID_VALUE',
    })
  } else if (!Number.isInteger(config.dias_vencimento)) {
    errors.push({
      field: 'dias_vencimento',
      message: 'Dias para vencimento deve ser um número inteiro',
      code: 'INVALID_VALUE',
    })
  }

  // Validação: dias_vencimento deve ser maior que dias_inicio
  if (
    config.dias_vencimento !== null &&
    config.dias_vencimento !== undefined &&
    config.dias_inicio !== null &&
    config.dias_inicio !== undefined &&
    config.dias_vencimento <= config.dias_inicio
  ) {
    errors.push({
      field: 'dias_vencimento',
      message: 'Dias para vencimento deve ser maior que dias para ativação',
      code: 'INVALID_VALUE',
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Extrai variáveis de uma string (formato {{variavel}})
 */
function extractVariables(text) {
  const regex = /\{\{([^}]+)\}\}/g
  const matches = []
  let match

  while ((match = regex.exec(text)) !== null) {
    matches.push(`{{${match[1]}}}`)
  }

  return matches
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// ============================================
// BATCH VALIDATION FUNCTIONS
// ============================================

/**
 * Valida todos os nodes de uma vez e retorna resultado agregado
 * @param {Array} nodes - Array de nodes do fluxo
 * @param {Array} edges - Array de conexoes entre nodes
 * @returns {Object} Resultado com { valid, nodeResults, structureValid, errors }
 */
export function validateAllNodes(nodes, edges) {
  const nodeResults = {}
  const allErrors = []

  // Validate flow structure first
  const structureValid = validateFlowStructure(nodes, edges)
  if (!structureValid) {
    allErrors.push({
      type: 'structure',
      message: 'Estrutura do fluxo invalida',
      code: 'INVALID_STRUCTURE',
    })
  }

  // Validate each node's configuration
  for (const node of nodes) {
    const result = validateNodeConfig(node.type, node.data?.config || {})
    nodeResults[node.id] = {
      ...result,
      type: node.type,
      label: node.data?.label || node.id,
    }

    if (!result.valid) {
      result.errors.forEach(err => {
        allErrors.push({
          type: 'node',
          nodeId: node.id,
          nodeType: node.type,
          nodeLabel: node.data?.label || node.id,
          ...err,
        })
      })
    }
  }

  // Check for disconnected nodes
  for (const node of nodes) {
    if (node.type === 'trigger') continue

    const hasIncomingEdge = edges.some(edge => edge.target === node.id)
    if (!hasIncomingEdge) {
      allErrors.push({
        type: 'connection',
        nodeId: node.id,
        nodeType: node.type,
        nodeLabel: node.data?.label || node.id,
        field: 'connection',
        message: `Node "${node.data?.label || node.id}" nao esta conectado ao fluxo`,
        code: 'DISCONNECTED_NODE',
      })
    }
  }

  const valid = structureValid && Object.values(nodeResults).every(r => r.valid) && allErrors.filter(e => e.type === 'connection').length === 0

  return {
    valid,
    structureValid,
    nodeResults,
    errors: allErrors,
    summary: {
      totalNodes: nodes.length,
      validNodes: Object.values(nodeResults).filter(r => r.valid).length,
      invalidNodes: Object.values(nodeResults).filter(r => !r.valid).length,
      totalErrors: allErrors.length,
    },
  }
}

/**
 * Obtem erros formatados para exibicao
 * @param {Object} validationResult - Resultado de validateAllNodes
 * @returns {Array} Array de strings de erro formatadas
 */
export function getFormattedErrors(validationResult) {
  if (!validationResult || !validationResult.errors) {
    return []
  }

  return validationResult.errors.map(err => {
    if (err.type === 'structure') {
      return err.message
    }
    if (err.type === 'connection') {
      return err.message
    }
    return `[${err.nodeLabel || err.nodeId}] ${err.message}`
  })
}

/**
 * Atualiza nodes com informacoes de validacao
 * @param {Array} nodes - Array de nodes do fluxo
 * @param {Object} validationResult - Resultado de validateAllNodes
 * @returns {Array} Nodes atualizados com data.valid e data.errors
 */
export function updateNodesWithValidation(nodes, validationResult) {
  if (!validationResult || !validationResult.nodeResults) {
    return nodes
  }

  return nodes.map(node => {
    const nodeResult = validationResult.nodeResults[node.id]
    if (!nodeResult) {
      return node
    }

    return {
      ...node,
      data: {
        ...node.data,
        valid: nodeResult.valid,
        errors: nodeResult.errors.map(e => e.message),
      },
    }
  })
}

/**
 * Verifica se um node especifico tem erros de conexao
 * @param {string} nodeId - ID do node
 * @param {Array} edges - Array de edges
 * @param {string} nodeType - Tipo do node
 * @returns {boolean}
 */
export function hasConnectionError(nodeId, edges, nodeType) {
  if (nodeType === 'trigger') {
    return false // Trigger doesn't need incoming connections
  }
  return !edges.some(edge => edge.target === nodeId)
}

/**
 * Obtem sugestoes de correcao para erros
 * @param {Object} error - Objeto de erro
 * @returns {string} Sugestao de correcao
 */
export function getErrorSuggestion(error) {
  const suggestions = {
    REQUIRED_FIELD: 'Preencha o campo obrigatorio',
    INVALID_VALUE: 'Verifique o valor informado',
    MAX_LENGTH: 'Reduza o tamanho do texto',
    INVALID_URL: 'Verifique se a URL esta correta',
    INVALID_EMAIL: 'Verifique se o email esta no formato correto',
    UNMAPPED_VARIABLE: 'Configure o mapeamento da variavel',
    INVALID_NODE_TYPE: 'Tipo de node nao reconhecido',
    DISCONNECTED_NODE: 'Conecte este node a um node anterior no fluxo',
    INVALID_STRUCTURE: 'Verifique se o fluxo tem um gatilho e pelo menos uma acao',
  }

  return suggestions[error.code] || 'Verifique a configuracao'
}

/**
 * Agrupa erros por node
 * @param {Array} errors - Array de erros
 * @returns {Object} Erros agrupados por nodeId
 */
export function groupErrorsByNode(errors) {
  const grouped = {}

  for (const error of errors) {
    if (error.type === 'structure') {
      if (!grouped['_structure']) {
        grouped['_structure'] = []
      }
      grouped['_structure'].push(error)
    } else if (error.nodeId) {
      if (!grouped[error.nodeId]) {
        grouped[error.nodeId] = []
      }
      grouped[error.nodeId].push(error)
    }
  }

  return grouped
}

/**
 * Verifica se o fluxo esta pronto para exportacao
 * @param {Array} nodes - Array de nodes
 * @param {Array} edges - Array de edges
 * @returns {Object} { ready: boolean, issues: string[] }
 */
export function checkExportReadiness(nodes, edges) {
  const issues = []

  // Must have trigger
  const triggerNode = nodes.find(n => n.type === 'trigger')
  if (!triggerNode) {
    issues.push('Fluxo deve ter um gatilho')
  } else if (!triggerNode.data?.config?.status_to) {
    issues.push('Gatilho deve ter status de destino configurado')
  }

  // Must have at least one action
  const actionNodes = nodes.filter(n => n.type !== 'trigger')
  if (actionNodes.length === 0) {
    issues.push('Fluxo deve ter pelo menos uma acao')
  }

  // All nodes must be valid
  const validation = validateAllNodes(nodes, edges)
  if (!validation.valid) {
    const invalidNodes = Object.entries(validation.nodeResults)
      .filter(([_, result]) => !result.valid)
      .map(([_, result]) => result.label)

    if (invalidNodes.length > 0) {
      issues.push(`Nodes com configuracao invalida: ${invalidNodes.join(', ')}`)
    }
  }

  return {
    ready: issues.length === 0,
    issues,
  }
}
