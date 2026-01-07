// ============================================
// VUE FLOW TYPES (Para Flow Builder)
// ============================================

export interface FlowNode {
  id: string                    // ex: "node_1", "node_2"
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
  draggable?: boolean
  selectable?: boolean
  connectable?: boolean
}

export type NodeType =
  | 'trigger'
  | 'send_sms'
  | 'send_whatsapp'
  | 'send_email'
  | 'delay'
  | 'condition'

export interface NodeData {
  label: string
  config: AcaoConfig | TriggerConfig
  ordem?: number
  valid?: boolean // indica se configuracao esta valida
  errors?: string[]
}

export interface FlowEdge {
  id: string                    // ex: "edge_1-2"
  source: string                // id do node origem
  target: string                // id do node destino
  type?: 'default' | 'step' | 'smoothstep' | 'straight'
  sourceHandle?: string
  targetHandle?: string
  label?: string                // ex: "Sim", "Nao" (para condition)
  animated?: boolean
}

// ============================================
// CONFIG TYPES (JSONB Fields)
// ============================================

export interface TriggerConfig {
  status_from?: string  // null = qualquer status inicial
  status_to: string     // ex: "paid", "delivered", "cancelled"
}

export type AcaoConfig =
  | SendSMSConfig
  | SendWhatsAppConfig
  | SendEmailConfig
  | DelayConfig
  | ConditionConfig

export interface SendSMSConfig {
  origem?: 'template' | 'custom'
  template_id?: number
  mensagem?: string
  variaveis?: Record<string, string> // mapeamento de variaveis
}

export interface SendWhatsAppConfig {
  origem?: 'template' | 'custom'
  template_id?: number
  mensagem?: string
  variaveis?: Record<string, string>
  media_url?: string
}

export interface SendEmailConfig {
  origem?: 'template' | 'custom'
  template_id?: number
  assunto?: string
  mensagem_html?: string
  mensagem_texto?: string
  variaveis?: Record<string, string>
  de_nome?: string
  de_email?: string
}

export interface DelayConfig {
  tipo: 'minutos' | 'horas' | 'dias'
  valor: number
}

export interface ConditionConfig {
  campo: string           // ex: "trigger_data.total_pedido"
  operador: ConditionOperator
  valor: any
  tipo_campo: FieldType
  acao_verdadeiro: ConditionAction
  acao_falso: ConditionAction
}

export type ConditionOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'

export type FieldType = 'string' | 'number' | 'boolean' | 'date'

export type ConditionAction = 'continuar' | 'pular_proxima' | 'finalizar'

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: ValidationErrorCode
}

export type ValidationErrorCode =
  | 'REQUIRED_FIELD'
  | 'INVALID_VALUE'
  | 'MAX_LENGTH'
  | 'INVALID_URL'
  | 'INVALID_EMAIL'
  | 'UNMAPPED_VARIABLE'
  | 'INVALID_NODE_TYPE'
  | 'DISCONNECTED_NODE'
  | 'INVALID_STRUCTURE'

export interface BatchValidationResult {
  valid: boolean
  structureValid: boolean
  nodeResults: Record<string, NodeValidationResult>
  errors: BatchValidationError[]
  summary: ValidationSummary
}

export interface NodeValidationResult extends ValidationResult {
  type: NodeType
  label: string
}

export interface BatchValidationError extends ValidationError {
  type: 'structure' | 'node' | 'connection'
  nodeId?: string
  nodeType?: NodeType
  nodeLabel?: string
}

export interface ValidationSummary {
  totalNodes: number
  validNodes: number
  invalidNodes: number
  totalErrors: number
}

// ============================================
// FLOW EXPORT TYPES
// ============================================

export interface FluxoPayload {
  fluxo: FluxoData
  acoes: AcaoData[]
}

export interface FluxoData {
  nome: string
  descricao: string
  trigger_tipo: 'order_status_change'
  trigger_config: TriggerConfig
  ativo: boolean
}

export interface AcaoData {
  ordem: number
  tipo_acao: NodeType
  config: AcaoConfig
}

export interface ExportReadinessResult {
  ready: boolean
  issues: string[]
}

// ============================================
// HELPER TYPES
// ============================================

export interface MessageTemplate {
  id: number
  empresa_id: number
  nome: string
  tipo: 'sms' | 'whatsapp' | 'email'
  conteudo: string
  variaveis: string[]         // ex: ["{{nome}}", "{{pedido_total}}"]
  ativo: boolean
  criado_em: string
}

export interface StatusOption {
  value: string
  label: string
}

// ============================================
// COMPONENT TYPES
// ============================================

export interface NodeTypeConfig {
  label: string
  color: string
  gradient: string
}

export interface NodeTypeConfigMap {
  send_sms: NodeTypeConfig
  send_whatsapp: NodeTypeConfig
  send_email: NodeTypeConfig
  delay: NodeTypeConfig
  condition: NodeTypeConfig
  default: NodeTypeConfig
}

export interface AddNodeEvent {
  sourceNodeId: string
  sourceNodeType: NodeType
  position: 'top' | 'bottom'
}

export interface NodeConfigUpdateEvent {
  nodeId: string
  config: AcaoConfig | TriggerConfig
}

// ============================================
// VIEWPORT TYPES
// ============================================

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface ViewportBounds {
  minZoom: number
  maxZoom: number
}

// ============================================
// EVENT TYPES
// ============================================

export interface NodeClickEvent {
  node: FlowNode
}

export interface EdgeClickEvent {
  edge: FlowEdge
}

export interface ConnectEvent {
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface NodesChangeEvent {
  changes: NodeChange[]
}

export interface EdgesChangeEvent {
  changes: EdgeChange[]
}

export interface NodeChange {
  id: string
  type: 'position' | 'dimensions' | 'select' | 'remove' | 'add' | 'reset'
  position?: { x: number; y: number }
  dragging?: boolean
  selected?: boolean
}

export interface EdgeChange {
  id: string
  type: 'select' | 'remove' | 'add' | 'reset'
  selected?: boolean
}

export interface ViewportChangeEvent {
  viewport: Viewport
}

export interface FlowChangedEvent {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface ValidationChangedEvent {
  valid: boolean
  errors: string[]
  summary: ValidationSummary
}

export interface ExportRequestedEvent {
  nodes: FlowNode[]
  edges: FlowEdge[]
  acoes: AcaoData[]
  triggerConfig: TriggerConfig
}

// ============================================
// WEWEB INTEGRATION TYPES
// ============================================

export interface WeWebContent {
  // Data Properties
  fluxoId?: string | number
  readOnly?: boolean

  // UI Properties
  height?: string
  backgroundColor?: string

  // Templates
  smsTemplates?: MessageTemplate[]
  whatsappTemplates?: MessageTemplate[]
  emailTemplates?: MessageTemplate[]
  statusOptions?: StatusOption[]

  // UI Visibility
  showToolbar?: boolean
  showStatusPanel?: boolean
  showValidationButtons?: boolean
  showMinimap?: boolean

  // Behavior
  minZoom?: number
  maxZoom?: number
  defaultZoom?: number
  snapToGrid?: boolean
  snapGrid?: [number, number]
  panOnDrag?: boolean
  zoomOnScroll?: boolean

  // Flow Data
  initialNodes?: FlowNode[]
  initialEdges?: FlowEdge[]
}

export interface WeWebProps {
  uid: string
  content: WeWebContent
  wwEditorState?: WeWebEditorState
}

export interface WeWebEditorState {
  isEditing: boolean
  isSelected: boolean
}

// ============================================
// INTERNAL VARIABLES TYPES
// ============================================

export interface FlowBuilderVariables {
  selectedNodes: FlowNode[]
  selectedEdges: FlowEdge[]
  viewport: Viewport
  nodes: FlowNode[]
  edges: FlowEdge[]
  nodeCount: number
  edgeCount: number
  selectedNode: FlowNode | null
  isValid: boolean
  validationErrors: string[]
  triggerConfig: TriggerConfig
  exportedAcoes: AcaoData[]
}
