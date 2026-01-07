/**
 * Flow Converter Utilities
 * Converts between Vue Flow nodes/edges and database action format
 *
 * Based on: GUIA-IMPLEMENTACAO-FLUXOS-AUTOMACAO.md
 */

/**
 * Map internal node types to database tipo_acao
 */
const NODE_TYPE_TO_TIPO_ACAO = {
  'send_sms': 'send_sms',
  'send_whatsapp': 'send_whatsapp',
  'send_email': 'send_email',
  'delay': 'delay',
  'condition': 'condition',
  'criar_cashback': 'criar_cashback',
}

/**
 * Map internal delay units to database format
 */
const DELAY_UNIT_MAP = {
  'minutes': 'minutos',
  'hours': 'horas',
  'days': 'dias',
  'weeks': 'semanas',
  // Portuguese to Portuguese (already correct)
  'minutos': 'minutos',
  'horas': 'horas',
  'dias': 'dias',
  'semanas': 'semanas',
}

/**
 * Human-readable labels for node types
 */
const NODE_LABELS = {
  trigger: 'Gatilho',
  send_sms: 'Enviar SMS',
  send_whatsapp: 'Enviar WhatsApp',
  send_email: 'Enviar E-mail',
  delay: 'Aguardar',
  condition: 'Condição',
  criar_cashback: 'Criar Cashback',
}

/**
 * Converte nodes do Vue Flow para o formato de acoes do banco
 * Usa arquitetura de grafo dirigido com temp_id e proxima_acao
 *
 * @param {Array} nodes - Array de nodes do fluxo
 * @param {Array} edges - Array de conexoes entre nodes
 * @returns {Array} Array de acoes no formato SalvarAcaoPayload
 */
export function convertNodesToAcoes(nodes, edges) {
  // Filter out trigger and conditional_branch nodes for the action list
  const actionNodes = nodes.filter(node =>
    node.type !== 'trigger' && node.type !== 'conditional_branch'
  )

  // Build a map of node connections
  // For condition nodes, we need to find the Sim/Não branches
  const connectionMap = buildConnectionMap(nodes, edges)

  return actionNodes.map((node, index) => {
    const tipoAcao = NODE_TYPE_TO_TIPO_ACAO[node.type] || node.type
    const config = formatConfigForDatabase(node.type, node.data?.config || {})

    const acao = {
      temp_id: node.id,  // Use node.id as temp_id
      ordem: index + 1,  // DEPRECATED but kept for compatibility
      nome: node.data?.label || NODE_LABELS[node.type] || null,
      tipo_acao: tipoAcao,
      config: config,
    }

    // Handle connections based on node type
    if (node.type === 'condition') {
      // For condition nodes, find the true/false branches
      const branches = connectionMap.get(node.id) || {}
      acao.proxima_acao_true = branches.true || null
      acao.proxima_acao_false = branches.false || null
    } else {
      // For regular nodes, find the next action
      const nextAction = connectionMap.get(node.id)
      acao.proxima_acao = nextAction?.next || null
    }

    return acao
  })
}

/**
 * Build a map of node connections
 * Maps node.id -> { next: temp_id } for regular nodes
 * Maps node.id -> { true: temp_id, false: temp_id } for condition nodes
 *
 * @param {Array} nodes - All nodes including trigger and conditional_branch
 * @param {Array} edges - All edges
 * @returns {Map} Connection map
 */
function buildConnectionMap(nodes, edges) {
  const connectionMap = new Map()

  // Get all conditional_branch nodes for reference
  const branchNodes = nodes.filter(n => n.type === 'conditional_branch')

  // Get all action nodes (excluding trigger and conditional_branch)
  const actionNodes = nodes.filter(n =>
    n.type !== 'trigger' && n.type !== 'conditional_branch'
  )

  for (const node of actionNodes) {
    if (node.type === 'condition') {
      // For condition nodes, find the Sim (true) and Não (false) branches
      const outgoingEdges = edges.filter(e => e.source === node.id)

      const branches = { true: null, false: null }

      for (const edge of outgoingEdges) {
        // Find the target node
        const targetNode = nodes.find(n => n.id === edge.target)

        if (targetNode?.type === 'conditional_branch') {
          // This is a branch node (Sim/Não)
          const branchType = targetNode.data?.branchType ||
            (targetNode.data?.label === 'Sim' ? 'true' : 'false')

          // Find what's connected after this branch node
          const branchOutgoing = edges.find(e => e.source === targetNode.id)
          if (branchOutgoing) {
            const nextNode = nodes.find(n => n.id === branchOutgoing.target)
            // Only reference action nodes, not other branch nodes
            if (nextNode && nextNode.type !== 'conditional_branch' && nextNode.type !== 'trigger') {
              branches[branchType] = nextNode.id
            }
          }
        } else if (targetNode && targetNode.type !== 'trigger') {
          // Direct connection to an action node (shouldn't happen with proper condition setup)
          // Default to true branch
          branches.true = targetNode.id
        }
      }

      connectionMap.set(node.id, branches)
    } else {
      // For regular nodes, find the next action
      const outgoingEdge = edges.find(e => e.source === node.id)

      if (outgoingEdge) {
        let targetNode = nodes.find(n => n.id === outgoingEdge.target)

        // Skip conditional_branch nodes and find the actual next action
        while (targetNode?.type === 'conditional_branch') {
          const nextEdge = edges.find(e => e.source === targetNode.id)
          if (nextEdge) {
            targetNode = nodes.find(n => n.id === nextEdge.target)
          } else {
            targetNode = null
          }
        }

        // Only reference action nodes
        if (targetNode && targetNode.type !== 'trigger' && targetNode.type !== 'conditional_branch') {
          connectionMap.set(node.id, { next: targetNode.id })
        } else {
          connectionMap.set(node.id, { next: null })
        }
      } else {
        connectionMap.set(node.id, { next: null })
      }
    }
  }

  return connectionMap
}

/**
 * Format config object for database based on action type
 * @param {string} nodeType - Type of the node
 * @param {Object} config - Raw config from the node
 * @returns {Object} Formatted config for database
 */
function formatConfigForDatabase(nodeType, config) {
  switch (nodeType) {
    case 'send_sms':
    case 'send_whatsapp':
    case 'send_email':
      // EnvioConfig: { template_id: number }
      return {
        template_id: config.template_id || null,
      }

    case 'delay':
      // DelayConfig: { quantidade: number, unidade: 'minutos' | 'horas' | 'dias' }
      return {
        quantidade: config.valor || config.quantidade || 0,
        unidade: DELAY_UNIT_MAP[config.tipo] || DELAY_UNIT_MAP[config.unidade] || 'horas',
      }

    case 'condition':
      // CondicaoConfig: { field, operator, value, acao_true_id?, acao_false_id? }
      return {
        field: config.condicao?.field || config.campo || null,
        operator: config.condicao?.operator || config.operador || '=',
        value: config.condicao?.value ?? config.valor ?? null,
        // acao_true_id and acao_false_id are set after ações are created
      }

    case 'criar_cashback':
      // CashbackConfig: custom extension
      return {
        cashback_percentual: config.cashback_percentual ?? null,
        desconto_max_percentual: config.desconto_max_percentual ?? null,
        dias_inicio: config.dias_inicio ?? null,
        dias_vencimento: config.dias_vencimento ?? null,
      }

    default:
      return cleanConfig(config)
  }
}

/**
 * Converte acoes do banco de dados para nodes/edges do Vue Flow
 * Suporta o novo formato de grafo dirigido com proxima_acao
 *
 * @param {Array} acoes - Array de acoes do banco
 * @param {Object} triggerConfig - Configuracao do gatilho
 * @param {number} primeiraAcaoId - ID da primeira ação (opcional)
 * @returns {Object} Objeto com { nodes, edges }
 */
export function convertAcoesToNodes(acoes, triggerConfig, primeiraAcaoId = null) {
  const nodes = []
  const edges = []

  // Add trigger node first
  const triggerNodeId = 'trigger_1'
  nodes.push({
    id: triggerNodeId,
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: {
      label: 'Gatilho: Mudança de Status',
      config: triggerConfig || { status_from: '', status_to: '' },
      ordem: 0,
      valid: Boolean(triggerConfig?.status_to),
      errors: triggerConfig?.status_to ? [] : ['status_to é obrigatório'],
    },
    draggable: false,
    selectable: true,
    connectable: true,
  })

  if (!acoes || acoes.length === 0) {
    return { nodes, edges }
  }

  // Build a map of action ID -> action data
  const acaoMap = new Map()
  for (const acao of acoes) {
    acaoMap.set(acao.id, acao)
  }

  // Map real IDs to node IDs for Vue Flow
  const idToNodeId = new Map()
  let nodeCounter = 1

  // Create nodes for all actions
  for (const acao of acoes) {
    const nodeId = `node_${acao.id}`
    idToNodeId.set(acao.id, nodeId)

    const nodeType = acao.tipo_acao
    const nodeConfig = formatConfigForNode(nodeType, acao.config)

    nodes.push({
      id: nodeId,
      type: nodeType,
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: acao.nome || NODE_LABELS[nodeType] || nodeType,
        config: nodeConfig,
        dbId: acao.id, // Keep reference to database ID
        valid: true,
        errors: [],
      },
      draggable: true,
      selectable: true,
      connectable: true,
    })

    // For condition nodes, create the Sim/Não branch nodes
    if (nodeType === 'condition') {
      // Create "Sim" branch node
      const simNodeId = `branch_${acao.id}_true`
      nodes.push({
        id: simNodeId,
        type: 'conditional_branch',
        position: { x: 0, y: 0 },
        data: {
          label: 'Sim',
          branchType: 'true',
        },
        draggable: true,
        selectable: true,
        connectable: true,
      })

      // Create "Não" branch node
      const naoNodeId = `branch_${acao.id}_false`
      nodes.push({
        id: naoNodeId,
        type: 'conditional_branch',
        position: { x: 0, y: 0 },
        data: {
          label: 'Não',
          branchType: 'false',
        },
        draggable: true,
        selectable: true,
        connectable: true,
      })

      // Edges from condition to branch nodes
      edges.push({
        id: `edge_${nodeId}-${simNodeId}`,
        source: nodeId,
        target: simNodeId,
        type: 'smoothstep',
        animated: false,
      })

      edges.push({
        id: `edge_${nodeId}-${naoNodeId}`,
        source: nodeId,
        target: naoNodeId,
        type: 'smoothstep',
        animated: false,
      })

      // Store branch node IDs for later edge creation
      idToNodeId.set(`${acao.id}_true_branch`, simNodeId)
      idToNodeId.set(`${acao.id}_false_branch`, naoNodeId)
    }
  }

  // Find the first action (use primeiraAcaoId or find by following the chain)
  let firstAcaoId = primeiraAcaoId
  if (!firstAcaoId && acoes.length > 0) {
    // Find action that is not referenced by any other action's proxima_acao
    const referencedIds = new Set()
    for (const acao of acoes) {
      if (acao.proxima_acao) referencedIds.add(acao.proxima_acao)
      if (acao.proxima_acao_true) referencedIds.add(acao.proxima_acao_true)
      if (acao.proxima_acao_false) referencedIds.add(acao.proxima_acao_false)
    }
    const firstAcao = acoes.find(a => !referencedIds.has(a.id))
    firstAcaoId = firstAcao?.id || acoes[0]?.id
  }

  // Edge from trigger to first action
  if (firstAcaoId && idToNodeId.has(firstAcaoId)) {
    edges.push({
      id: `edge_${triggerNodeId}-${idToNodeId.get(firstAcaoId)}`,
      source: triggerNodeId,
      target: idToNodeId.get(firstAcaoId),
      type: 'smoothstep',
      animated: false,
    })
  }

  // Create edges based on proxima_acao relationships
  for (const acao of acoes) {
    const sourceNodeId = idToNodeId.get(acao.id)

    if (acao.tipo_acao === 'condition') {
      // For conditions, connect branch nodes to next actions
      const simBranchId = idToNodeId.get(`${acao.id}_true_branch`)
      const naoBranchId = idToNodeId.get(`${acao.id}_false_branch`)

      if (acao.proxima_acao_true && idToNodeId.has(acao.proxima_acao_true)) {
        edges.push({
          id: `edge_${simBranchId}-${idToNodeId.get(acao.proxima_acao_true)}`,
          source: simBranchId,
          target: idToNodeId.get(acao.proxima_acao_true),
          type: 'smoothstep',
          animated: false,
        })
      }

      if (acao.proxima_acao_false && idToNodeId.has(acao.proxima_acao_false)) {
        edges.push({
          id: `edge_${naoBranchId}-${idToNodeId.get(acao.proxima_acao_false)}`,
          source: naoBranchId,
          target: idToNodeId.get(acao.proxima_acao_false),
          type: 'smoothstep',
          animated: false,
        })
      }
    } else {
      // For regular nodes, connect to next action
      if (acao.proxima_acao && idToNodeId.has(acao.proxima_acao)) {
        edges.push({
          id: `edge_${sourceNodeId}-${idToNodeId.get(acao.proxima_acao)}`,
          source: sourceNodeId,
          target: idToNodeId.get(acao.proxima_acao),
          type: 'smoothstep',
          animated: false,
        })
      }
    }
  }

  return { nodes, edges }
}

/**
 * Format config from database to node format
 * @param {string} nodeType - Type of the node
 * @param {Object} config - Config from database
 * @returns {Object} Config formatted for node
 */
function formatConfigForNode(nodeType, config) {
  if (!config) return {}

  switch (nodeType) {
    case 'send_sms':
    case 'send_whatsapp':
    case 'send_email':
      return {
        origem: 'template',
        template_id: config.template_id || '',
        template_nome: config.template_nome || '',
        template_conteudo: config.template_conteudo || '',
      }

    case 'delay':
      return {
        tipo: config.unidade || 'horas',
        valor: config.quantidade || 0,
      }

    case 'condition':
      return {
        condicao: {
          field: config.field || '',
          operator: config.operator || '=',
          value: config.value ?? '',
        }
      }

    case 'criar_cashback':
      return {
        cashback_percentual: config.cashback_percentual ?? null,
        desconto_max_percentual: config.desconto_max_percentual ?? null,
        dias_inicio: config.dias_inicio ?? null,
        dias_vencimento: config.dias_vencimento ?? null,
      }

    default:
      return config
  }
}

/**
 * Extrai a configuracao do trigger do array de nodes
 * @param {Array} nodes - Array de nodes do fluxo
 * @returns {Object} Configuracao do trigger
 */
export function getTriggerConfig(nodes) {
  const triggerNode = nodes.find(node => node.type === 'trigger')

  if (!triggerNode) {
    return { status_from: null, status_to: '' }
  }

  return {
    status_from: triggerNode.data?.config?.status_from || null,
    status_to: triggerNode.data?.config?.status_to || '',
  }
}

/**
 * Valida se o fluxo pode ser exportado/salvo
 * @param {Array} nodes - Array de nodes
 * @param {Array} edges - Array de edges
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateFlowForExport(nodes, edges) {
  const errors = []

  // Must have trigger
  const triggerNode = nodes.find(n => n.type === 'trigger')
  if (!triggerNode) {
    errors.push('Fluxo deve ter um gatilho')
  } else if (!triggerNode.data?.config?.status_to) {
    errors.push('Gatilho deve ter status de destino configurado')
  }

  // Must have at least one action
  const actionNodes = nodes.filter(n => n.type !== 'trigger' && n.type !== 'conditional_branch')
  if (actionNodes.length === 0) {
    errors.push('Fluxo deve ter pelo menos uma ação')
  }

  // All action nodes must be connected
  for (const node of actionNodes) {
    const hasIncomingEdge = edges.some(e => e.target === node.id)
    if (!hasIncomingEdge) {
      errors.push(`Node "${node.data?.label || node.id}" não está conectado`)
    }
  }

  // All nodes must be valid
  for (const node of nodes) {
    if (node.type !== 'conditional_branch' && !node.data?.valid) {
      errors.push(`Node "${node.data?.label || node.id}" tem configuração inválida`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Gera estrutura completa para salvar no banco
 * Formato conforme GUIA-IMPLEMENTACAO-FLUXOS-AUTOMACAO.md
 *
 * @param {Object} params - Parametros
 * @param {string} params.nome - Nome do fluxo
 * @param {string} params.descricao - Descricao do fluxo
 * @param {Array} params.nodes - Nodes do fluxo
 * @param {Array} params.edges - Edges do fluxo
 * @param {boolean} params.ativo - Se o fluxo está ativo
 * @param {boolean} params.permitir_reentrada - Permitir reentrada
 * @param {number} params.intervalo_reentrada_dias - Intervalo de reentrada em dias
 * @returns {Object} Estrutura pronta para INSERT { fluxo, acoes }
 */
export function generateFluxoPayload({
  nome,
  descricao,
  nodes,
  edges,
  ativo = false,
  permitir_reentrada = false,
  intervalo_reentrada_dias = null,
}) {
  const triggerConfig = getTriggerConfig(nodes)
  const acoes = convertNodesToAcoes(nodes, edges)

  return {
    fluxo: {
      nome: nome || 'Novo Fluxo',
      descricao: descricao || null,
      trigger_tipo: 'order_status_change',
      trigger_config: triggerConfig,
      ativo: ativo,
      permitir_reentrada: permitir_reentrada,
      intervalo_reentrada_dias: intervalo_reentrada_dias,
    },
    acoes,
  }
}

/**
 * Gera payload para atualizar um fluxo existente
 * @param {Object} params - Parametros
 * @returns {Object} Estrutura para UPDATE
 */
export function generateUpdatePayload({
  nome,
  descricao,
  nodes,
  edges,
  ativo,
  permitir_reentrada,
  intervalo_reentrada_dias,
}) {
  const triggerConfig = getTriggerConfig(nodes)
  const acoes = convertNodesToAcoes(nodes, edges)

  const fluxoUpdate = {}

  if (nome !== undefined) fluxoUpdate.nome = nome
  if (descricao !== undefined) fluxoUpdate.descricao = descricao
  if (triggerConfig) fluxoUpdate.trigger_config = triggerConfig
  if (ativo !== undefined) fluxoUpdate.ativo = ativo
  if (permitir_reentrada !== undefined) fluxoUpdate.permitir_reentrada = permitir_reentrada
  if (intervalo_reentrada_dias !== undefined) fluxoUpdate.intervalo_reentrada_dias = intervalo_reentrada_dias

  return {
    fluxo: fluxoUpdate,
    acoes,
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Topological sort for nodes based on edges
 */
function topologicalSort(nodes, edges) {
  const graph = buildGraph(nodes, edges)
  const sorted = []
  const visited = new Set()
  const inProgress = new Set()

  function dfs(nodeId) {
    if (inProgress.has(nodeId)) {
      console.warn('Cycle detected in flow graph')
      return
    }
    if (visited.has(nodeId)) return

    inProgress.add(nodeId)

    const neighbors = graph.get(nodeId) || []
    for (const neighborId of neighbors) {
      dfs(neighborId)
    }

    inProgress.delete(nodeId)
    visited.add(nodeId)

    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      sorted.unshift(node)
    }
  }

  // Find nodes with no incoming edges (entry points)
  const entryNodes = nodes.filter(node => {
    return !edges.some(e => e.target === node.id)
  })

  // Start DFS from entry points
  for (const node of entryNodes) {
    if (!visited.has(node.id)) {
      dfs(node.id)
    }
  }

  // Process any remaining nodes (disconnected)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id)
    }
  }

  return sorted
}

/**
 * Build adjacency list graph from edges
 */
function buildGraph(nodes, edges) {
  const graph = new Map()

  for (const node of nodes) {
    graph.set(node.id, [])
  }

  for (const edge of edges) {
    // Only consider edges between action nodes
    const sourceNode = nodes.find(n => n.id === edge.source)
    if (sourceNode) {
      const neighbors = graph.get(edge.source) || []
      neighbors.push(edge.target)
      graph.set(edge.source, neighbors)
    }
  }

  return graph
}

/**
 * Get human-readable label for node type
 */
function getNodeLabel(type) {
  return NODE_LABELS[type] || type
}

/**
 * Clean config object, removing empty/null values
 */
function cleanConfig(config) {
  const cleaned = {}

  for (const [key, value] of Object.entries(config)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanConfig(value)
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested
        }
      } else {
        cleaned[key] = value
      }
    }
  }

  return cleaned
}

/**
 * Calculate node positions for auto-layout
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @returns {Array} Nodes with updated positions
 */
export function autoLayoutNodes(nodes, edges) {
  const sorted = topologicalSort(nodes, edges)
  const xCenter = 250
  const yStart = 50
  const ySpacing = 150

  return sorted.map((node, index) => ({
    ...node,
    position: {
      x: xCenter,
      y: yStart + index * ySpacing,
    },
  }))
}
