export default {
  editor: {
    label: {
      en: 'Flow Builder',
      pt: 'Construtor de Fluxos',
    },
    icon: 'workflow',
  },

  // ============================================
  // INTERNAL VARIABLES
  // ============================================
  variables: [
    {
      name: 'selectedNodes',
      value: [],
      type: 'array',
      label: { en: 'Selected Nodes', pt: 'Nodes Selecionados' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Array of currently selected nodes in the flow',
      },
      /* wwEditor:end */
    },
    {
      name: 'selectedEdges',
      value: [],
      type: 'array',
      label: { en: 'Selected Edges', pt: 'Edges Selecionadas' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Array of currently selected edges in the flow',
      },
      /* wwEditor:end */
    },
    {
      name: 'viewport',
      value: { x: 0, y: 0, zoom: 1 },
      type: 'object',
      label: { en: 'Viewport', pt: 'Viewport' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Current viewport position and zoom level',
      },
      /* wwEditor:end */
    },
    {
      name: 'nodes',
      value: [],
      type: 'array',
      label: { en: 'Nodes', pt: 'Nodes' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Array of all nodes in the flow',
      },
      /* wwEditor:end */
    },
    {
      name: 'edges',
      value: [],
      type: 'array',
      label: { en: 'Edges', pt: 'Edges' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Array of all edges (connections) in the flow',
      },
      /* wwEditor:end */
    },
    {
      name: 'nodeCount',
      value: 0,
      type: 'number',
      label: { en: 'Node Count', pt: 'Quantidade de Nodes' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Total number of nodes in the flow',
      },
      /* wwEditor:end */
    },
    {
      name: 'edgeCount',
      value: 0,
      type: 'number',
      label: { en: 'Edge Count', pt: 'Quantidade de Edges' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Total number of edges in the flow',
      },
      /* wwEditor:end */
    },
    {
      name: 'selectedNode',
      value: null,
      type: 'object',
      label: { en: 'Selected Node', pt: 'Node Selecionado' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Currently selected node for configuration',
      },
      /* wwEditor:end */
    },
    {
      name: 'isValid',
      value: false,
      type: 'boolean',
      label: { en: 'Is Flow Valid', pt: 'Fluxo Valido' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Indicates whether the current flow configuration is valid',
      },
      /* wwEditor:end */
    },
    {
      name: 'validationErrors',
      value: [],
      type: 'array',
      label: { en: 'Validation Errors', pt: 'Erros de Validacao' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Array of validation error messages',
      },
      /* wwEditor:end */
    },
    {
      name: 'triggerConfig',
      value: { status_from: '', status_to: '' },
      type: 'object',
      label: { en: 'Trigger Config', pt: 'Configuracao do Gatilho' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Configuration of the trigger node (status_from, status_to)',
      },
      /* wwEditor:end */
    },
    {
      name: 'exportedAcoes',
      value: [],
      type: 'array',
      label: { en: 'Exported Actions', pt: 'Acoes Exportadas' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Array of actions in database format (ready for save)',
      },
      /* wwEditor:end */
    },
    {
      name: 'flowName',
      value: 'Novo Fluxo',
      type: 'string',
      label: { en: 'Flow Name', pt: 'Nome do Fluxo' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Current name of the flow (editable in header)',
      },
      /* wwEditor:end */
    },
    {
      name: 'loadedFluxoId',
      value: null,
      type: 'number',
      label: { en: 'Loaded Flow ID', pt: 'ID do Fluxo Carregado' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'ID of the flow loaded from URL query string (null for new flow)',
      },
      /* wwEditor:end */
    },
    {
      name: 'isLoadingFlow',
      value: false,
      type: 'boolean',
      label: { en: 'Is Loading Flow', pt: 'Carregando Fluxo' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'True while loading a flow from the database',
      },
      /* wwEditor:end */
    },
  ],

  // ============================================
  // TRIGGER EVENTS
  // ============================================
  triggerEvents: [
    {
      name: 'node-click',
      label: { en: 'On node click', pt: 'Ao clicar em node' },
      event: { node: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a node is clicked',
      },
      /* wwEditor:end */
    },
    {
      name: 'edge-click',
      label: { en: 'On edge click', pt: 'Ao clicar em edge' },
      event: { edge: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when an edge is clicked',
      },
      /* wwEditor:end */
    },
    {
      name: 'node-drag-stop',
      label: { en: 'On node drag stop', pt: 'Ao soltar node' },
      event: { node: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a node stops being dragged',
      },
      /* wwEditor:end */
    },
    {
      name: 'connect',
      label: { en: 'On nodes connected', pt: 'Ao conectar nodes' },
      event: { connection: {}, edge: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when two nodes are connected',
      },
      /* wwEditor:end */
    },
    {
      name: 'nodes-change',
      label: { en: 'On nodes change', pt: 'Ao alterar nodes' },
      event: { changes: [] },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when nodes are added, removed, or modified',
      },
      /* wwEditor:end */
    },
    {
      name: 'edges-change',
      label: { en: 'On edges change', pt: 'Ao alterar edges' },
      event: { changes: [] },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when edges are added, removed, or modified',
      },
      /* wwEditor:end */
    },
    {
      name: 'viewport-change',
      label: { en: 'On viewport change', pt: 'Ao alterar viewport' },
      event: { viewport: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when the viewport (pan/zoom) changes',
      },
      /* wwEditor:end */
    },
    {
      name: 'node-added',
      label: { en: 'On node added', pt: 'Ao adicionar node' },
      event: {
        node: {},
        sourceToNewEdge: {},
        newToTargetEdge: null,
        removedEdge: null,
        sourceNodeId: '',
        insertedBetween: null,
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a new node is added via the + button. Includes info about edge changes when inserting between existing nodes.',
      },
      /* wwEditor:end */
    },
    {
      name: 'node-selected',
      label: { en: 'On node selected', pt: 'Ao selecionar node' },
      event: { node: null },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a node is selected for configuration',
      },
      /* wwEditor:end */
    },
    {
      name: 'node-config-updated',
      label: { en: 'On node config updated', pt: 'Ao atualizar config do node' },
      event: { nodeId: '', config: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a node configuration is updated',
      },
      /* wwEditor:end */
    },
    {
      name: 'flow-changed',
      label: { en: 'On flow changed', pt: 'Ao alterar fluxo' },
      event: { nodes: [], edges: [] },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when the flow structure changes',
      },
      /* wwEditor:end */
    },
    {
      name: 'validation-changed',
      label: { en: 'On validation changed', pt: 'Ao alterar validacao' },
      event: { isValid: false, errors: [] },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when the validation status changes',
      },
      /* wwEditor:end */
    },
    {
      name: 'export-requested',
      label: { en: 'On export requested', pt: 'Ao solicitar exportacao' },
      event: { nodes: [], edges: [], acoes: [], triggerConfig: {} },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when export button is clicked. Contains data ready to save to database.',
      },
      /* wwEditor:end */
    },
    {
      name: 'validate-requested',
      label: { en: 'On validate requested', pt: 'Ao solicitar validacao' },
      event: { isValid: false, errors: [] },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when validate button is clicked',
      },
      /* wwEditor:end */
    },
    {
      name: 'node-deleted',
      label: { en: 'On node deleted', pt: 'Ao deletar node' },
      event: { nodeId: '', nodeType: '' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a node is deleted',
      },
      /* wwEditor:end */
    },
    {
      name: 'back',
      label: { en: 'On back click', pt: 'Ao clicar em voltar' },
      event: {},
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when the back button in the header is clicked',
      },
      /* wwEditor:end */
    },
    {
      name: 'save',
      label: { en: 'On save', pt: 'Ao salvar' },
      event: {
        success: false,
        message: '',
        error: '',
        fluxo: {},
        acoes: [],
        isValid: false,
        validationErrors: [],
        nodes: [],
        edges: [],
        triggerConfig: {},
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered after save attempt. Calls RPC salvar_fluxo_automacao. Check success property for result.',
      },
      /* wwEditor:end */
    },
    {
      name: 'flowNameChange',
      label: { en: 'On flow name change', pt: 'Ao mudar nome do fluxo' },
      event: { oldName: '', newName: '' },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when the flow name is edited by double-clicking in the header.',
      },
      /* wwEditor:end */
    },
    {
      name: 'flow-loaded',
      label: { en: 'On flow loaded', pt: 'Ao carregar fluxo' },
      event: { fluxo: {}, acoes: [], totalAcoes: 0 },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when a flow is successfully loaded from the database (via URL query string id)',
      },
      /* wwEditor:end */
    },
    {
      name: 'load-error',
      label: { en: 'On load error', pt: 'Erro ao carregar' },
      event: { error: '', fluxoId: null },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Triggered when there is an error loading a flow from the database',
      },
      /* wwEditor:end */
    },
  ],

  // ============================================
  // PROPERTIES
  // ============================================
  properties: {
    // ----------------------------------------
    // Flow Data
    // ----------------------------------------
    fluxoId: {
      label: { en: 'Flow ID', pt: 'ID do Fluxo' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'ID of the flow being edited (null for new flow)',
      },
      propertyHelp: {
        tooltip: 'Set to the flow ID when editing an existing flow, or leave null for a new flow',
      },
      /* wwEditor:end */
    },

    // NOTE: empresaId is now automatically fetched from collection '2a7ebac6-154a-4af7-8337-411e42e6a35c'
    // No need to configure it manually

    readOnly: {
      label: { en: 'Read Only', pt: 'Somente Leitura' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable read-only mode (view only)',
      },
      propertyHelp: {
        tooltip: 'When enabled, the flow cannot be edited',
      },
      /* wwEditor:end */
    },

    flowName: {
      label: { en: 'Flow Name', pt: 'Nome do Fluxo' },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Novo Fluxo',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Name of the flow displayed in the header',
      },
      propertyHelp: {
        tooltip: 'The name of the flow shown in the header bar. Double-click to edit.',
      },
      /* wwEditor:end */
    },

    logoUrl: {
      label: { en: 'Logo', pt: 'Logo' },
      type: 'Image',
      section: 'settings',
      defaultValue: '',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Logo image for the header',
      },
      propertyHelp: {
        tooltip: 'Upload or select a logo image to display in the header.',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Container Settings
    // ----------------------------------------
    height: {
      label: { en: 'Height', pt: 'Altura' },
      type: 'Length',
      section: 'settings',
      defaultValue: '100vh',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Height of the flow builder container (e.g., "100vh", "100%", "800px")',
      },
      propertyHelp: {
        tooltip: 'Set the height of the flow builder container. Use 100vh for full page.',
      },
      /* wwEditor:end */
    },

    backgroundColor: {
      label: { en: 'Background Color', pt: 'Cor de Fundo' },
      type: 'Color',
      section: 'style',
      defaultValue: '#f8fafc',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of the flow canvas',
      },
      /* wwEditor:end */
    },

    borderRadius: {
      label: { en: 'Border Radius', pt: 'Raio da Borda' },
      type: 'Length',
      section: 'style',
      defaultValue: '8px',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border radius of the container',
      },
      /* wwEditor:end */
    },

    showBorder: {
      label: { en: 'Show Border', pt: 'Mostrar Borda' },
      type: 'OnOff',
      section: 'style',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show or hide the container border',
      },
      /* wwEditor:end */
    },

    borderColor: {
      label: { en: 'Border Color', pt: 'Cor da Borda' },
      type: 'Color',
      section: 'style',
      defaultValue: '#e2e8f0',
      bindable: true,
      hidden: (content) => !content?.showBorder,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of the container border',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Initial Data
    // ----------------------------------------
    initialNodes: {
      label: { en: 'Initial Nodes', pt: 'Nodes Iniciais' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.data?.label || item?.type || `Node ${item?.id || 'Unknown'}`
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: 'node_1',
            type: 'default',
            position: { x: 0, y: 0 },
            data: { label: 'New Node', config: {} },
          },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              type: {
                label: { en: 'Type', pt: 'Tipo' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'trigger', label: 'Gatilho' },
                    { value: 'send_sms', label: 'Enviar SMS' },
                    { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
                    { value: 'send_email', label: 'Enviar Email' },
                    { value: 'delay', label: 'Aguardar' },
                    { value: 'condition', label: 'Condicao' },
                  ],
                },
              },
              position: {
                label: { en: 'Position', pt: 'Posicao' },
                type: 'Object',
                options: {
                  item: {
                    x: { label: { en: 'X' }, type: 'Number' },
                    y: { label: { en: 'Y' }, type: 'Number' },
                  },
                },
              },
              data: {
                label: { en: 'Data', pt: 'Dados' },
                type: 'Object',
                options: {
                  item: {
                    label: { label: { en: 'Label' }, type: 'Text' },
                  },
                },
              },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of node objects to initialize the flow',
      },
      propertyHelp: {
        tooltip: 'Initial nodes to display in the flow. Each node requires: id, type, position, and data.',
      },
      /* wwEditor:end */
    },

    initialEdges: {
      label: { en: 'Initial Edges', pt: 'Edges Iniciais' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.label || `${item?.source || '?'} -> ${item?.target || '?'}`
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: 'edge_1',
            source: '',
            target: '',
            type: 'smoothstep',
          },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              source: { label: { en: 'Source Node ID' }, type: 'Text' },
              target: { label: { en: 'Target Node ID' }, type: 'Text' },
              type: {
                label: { en: 'Type', pt: 'Tipo' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'default', label: 'Default' },
                    { value: 'smoothstep', label: 'Smooth Step' },
                    { value: 'step', label: 'Step' },
                    { value: 'straight', label: 'Straight' },
                  ],
                },
              },
              label: { label: { en: 'Label' }, type: 'Text' },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of edge objects to initialize connections',
      },
      propertyHelp: {
        tooltip: 'Initial edges to connect nodes. Each edge requires: id, source, and target.',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Templates (single collection, filtered by tipo)
    // ----------------------------------------
    messageTemplates: {
      label: { en: 'Message Templates', pt: 'Templates de Mensagem' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.nome || `Template ${item?.id || 'Unknown'}`
        },
        item: {
          type: 'Object',
          defaultValue: { id: 1, nome: 'Template', tipo: 'sms', conteudo: '', variaveis: [] },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Number' },
              nome: { label: { en: 'Name', pt: 'Nome' }, type: 'Text' },
              tipo: { label: { en: 'Type', pt: 'Tipo' }, type: 'Text' },
              conteudo: { label: { en: 'Content', pt: 'Conteúdo' }, type: 'Text' },
              variaveis: { label: { en: 'Variables', pt: 'Variáveis' }, type: 'Array' },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Bind to message_templates collection. Required fields: id, nome, tipo (sms/whatsapp/email), conteudo',
      },
      propertyHelp: {
        tooltip: 'Bind to message_templates table. The component will filter by tipo (sms, whatsapp, email) automatically.',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Status Options
    // ----------------------------------------
    statusOptions: {
      label: { en: 'Status Options', pt: 'Opcoes de Status' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { value: 'aberto', label: 'Aberto' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'concluido', label: 'Concluído' },
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.label || item?.value || 'Status'
        },
        item: {
          type: 'Object',
          defaultValue: { value: 'status', label: 'Status' },
          options: {
            item: {
              value: { label: { en: 'Value' }, type: 'Text' },
              label: { label: { en: 'Label' }, type: 'Text' },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of status options for trigger configuration',
      },
      propertyHelp: {
        tooltip: 'Status options available for trigger node configuration',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Flow Configuration
    // ----------------------------------------
    defaultNewNodeType: {
      label: { en: 'Default New Node Type', pt: 'Tipo Padrao de Novo Node' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'send_sms', label: 'Enviar SMS' },
          { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
          { value: 'send_email', label: 'Enviar Email' },
          { value: 'delay', label: 'Aguardar' },
          { value: 'condition', label: 'Condicao' },
        ],
      },
      defaultValue: 'send_sms',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Type of node created when clicking the + button',
      },
      propertyHelp: {
        tooltip: 'Select the default type for new nodes added via the + button',
      },
      /* wwEditor:end */
    },

    connectionMode: {
      label: { en: 'Connection Mode', pt: 'Modo de Conexao' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'loose', label: 'Loose' },
          { value: 'strict', label: 'Strict' },
        ],
      },
      defaultValue: 'loose',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Connection mode: loose (flexible) or strict (handles only)',
      },
      propertyHelp: {
        tooltip: 'Loose allows connecting to any point. Strict requires handle connections.',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // UI Elements Visibility
    // ----------------------------------------
    showToolbar: {
      label: { en: 'Show Toolbar', pt: 'Mostrar Toolbar' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the node type toolbar',
      },
      /* wwEditor:end */
    },

    showStatusPanel: {
      label: { en: 'Show Status Panel', pt: 'Mostrar Painel de Status' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the status panel (nodes count, validation status)',
      },
      /* wwEditor:end */
    },

    showActionButtons: {
      label: { en: 'Show Action Buttons', pt: 'Mostrar Botoes de Acao' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the validate and export buttons',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Zoom & Pan
    // ----------------------------------------
    initialZoom: {
      label: { en: 'Initial Zoom', pt: 'Zoom Inicial' },
      type: 'Number',
      section: 'settings',
      options: {
        min: 0.1,
        max: 4,
        step: 0.1,
      },
      defaultValue: 1,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Initial zoom level (0.1 - 4)',
      },
      /* wwEditor:end */
    },

    minZoom: {
      label: { en: 'Min Zoom', pt: 'Zoom Minimo' },
      type: 'Number',
      section: 'settings',
      options: {
        min: 0.1,
        max: 1,
        step: 0.05,
      },
      defaultValue: 0.25,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Minimum zoom level allowed',
      },
      /* wwEditor:end */
    },

    maxZoom: {
      label: { en: 'Max Zoom', pt: 'Zoom Maximo' },
      type: 'Number',
      section: 'settings',
      options: {
        min: 1,
        max: 10,
        step: 0.5,
      },
      defaultValue: 4,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Maximum zoom level allowed',
      },
      /* wwEditor:end */
    },

    panOnDrag: {
      label: { en: 'Pan on Drag', pt: 'Mover ao Arrastar' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable panning by dragging the canvas',
      },
      /* wwEditor:end */
    },

    zoomOnScroll: {
      label: { en: 'Zoom on Scroll', pt: 'Zoom com Scroll' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable zooming with mouse wheel',
      },
      /* wwEditor:end */
    },

    fitViewOnInit: {
      label: { en: 'Fit View on Init', pt: 'Ajustar Visualizacao ao Iniciar' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Automatically fit all nodes in view on initialization',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Snap to Grid
    // ----------------------------------------
    snapToGrid: {
      label: { en: 'Snap to Grid', pt: 'Encaixar na Grade' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable snapping nodes to grid when dragging',
      },
      /* wwEditor:end */
    },

    snapGridX: {
      label: { en: 'Grid Size X', pt: 'Tamanho Grade X' },
      type: 'Number',
      section: 'settings',
      options: {
        min: 5,
        max: 100,
        step: 5,
      },
      defaultValue: 20,
      bindable: true,
      hidden: (content) => !content?.snapToGrid,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Horizontal grid size for snapping',
      },
      /* wwEditor:end */
    },

    snapGridY: {
      label: { en: 'Grid Size Y', pt: 'Tamanho Grade Y' },
      type: 'Number',
      section: 'settings',
      options: {
        min: 5,
        max: 100,
        step: 5,
      },
      defaultValue: 20,
      bindable: true,
      hidden: (content) => !content?.snapToGrid,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Vertical grid size for snapping',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Background
    // ----------------------------------------
    backgroundPatternColor: {
      label: { en: 'Grid Pattern Color', pt: 'Cor do Padrao da Grade' },
      type: 'Color',
      section: 'style',
      defaultValue: '#e2e8f0',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of the background grid pattern',
      },
      /* wwEditor:end */
    },

    backgroundGap: {
      label: { en: 'Grid Gap', pt: 'Espacamento da Grade' },
      type: 'Number',
      section: 'style',
      options: {
        min: 5,
        max: 100,
        step: 5,
      },
      defaultValue: 20,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Gap between grid lines',
      },
      /* wwEditor:end */
    },

    backgroundSize: {
      label: { en: 'Grid Dot Size', pt: 'Tamanho do Ponto da Grade' },
      type: 'Number',
      section: 'style',
      options: {
        min: 0.5,
        max: 5,
        step: 0.5,
      },
      defaultValue: 1,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Size of the grid dots',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Controls
    // ----------------------------------------
    showControls: {
      label: { en: 'Show Controls', pt: 'Mostrar Controles' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show zoom and fit controls',
      },
      /* wwEditor:end */
    },

    showZoomControls: {
      label: { en: 'Show Zoom Buttons', pt: 'Mostrar Botoes de Zoom' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      hidden: (content) => !content?.showControls,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show zoom in/out buttons',
      },
      /* wwEditor:end */
    },

    showFitView: {
      label: { en: 'Show Fit View Button', pt: 'Mostrar Botao Ajustar' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      hidden: (content) => !content?.showControls,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show fit view button',
      },
      /* wwEditor:end */
    },

    showInteractive: {
      label: { en: 'Show Interactive Toggle', pt: 'Mostrar Toggle Interativo' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      hidden: (content) => !content?.showControls,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show interactive mode toggle button',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Minimap
    // ----------------------------------------
    showMinimap: {
      label: { en: 'Show Minimap', pt: 'Mostrar Minimapa' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show minimap navigation',
      },
      /* wwEditor:end */
    },

    minimapPannable: {
      label: { en: 'Minimap Pannable', pt: 'Minimapa Permite Mover' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      hidden: (content) => !content?.showMinimap,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Allow panning via minimap',
      },
      /* wwEditor:end */
    },

    minimapZoomable: {
      label: { en: 'Minimap Zoomable', pt: 'Minimapa Permite Zoom' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      hidden: (content) => !content?.showMinimap,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Allow zooming via minimap',
      },
      /* wwEditor:end */
    },

    // ----------------------------------------
    // Config Panel
    // ----------------------------------------
    showConfigPanel: {
      label: { en: 'Show Config Panel', pt: 'Mostrar Painel de Configuracao' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show the node configuration panel when a node is selected',
      },
      propertyHelp: {
        tooltip: 'When enabled, clicking on a node opens a configuration panel',
      },
      /* wwEditor:end */
    },

    configPanelPosition: {
      label: { en: 'Config Panel Position', pt: 'Posicao do Painel de Config' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'right', label: 'Right' },
          { value: 'left', label: 'Left' },
        ],
      },
      defaultValue: 'right',
      bindable: true,
      hidden: (content) => !content?.showConfigPanel,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Position of the config panel',
      },
      /* wwEditor:end */
    },

    configPanelWidth: {
      label: { en: 'Config Panel Width', pt: 'Largura do Painel de Config' },
      type: 'Length',
      section: 'settings',
      defaultValue: '320px',
      bindable: true,
      hidden: (content) => !content?.showConfigPanel,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Width of the config panel',
      },
      /* wwEditor:end */
    },
  },
}
