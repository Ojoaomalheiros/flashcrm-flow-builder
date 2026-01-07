<template>
  <div class="flow-builder-wrapper" :style="wrapperStyle">
    <!-- Header -->
    <header class="flow-header">
      <div class="header-left">
        <!-- Logo -->
        <div class="header-logo">
          <img
            v-if="logoUrl && !logoError"
            :src="logoUrl"
            alt="Logo"
            class="header-logo-img"
            @error="logoError = true"
          />
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#7c3aed"/>
          </svg>
        </div>
        <!-- Flow Name (editable on double-click) -->
        <input
          v-if="isEditingFlowName"
          ref="flowNameInputRef"
          v-model="editableFlowName"
          class="header-flow-name-input"
          @blur="handleFlowNameBlur"
          @keydown.enter="handleFlowNameBlur"
          @keydown.escape="cancelFlowNameEdit"
        />
        <template v-else>
          <span
            class="header-flow-name"
            @dblclick="startFlowNameEdit"
            title="Clique duas vezes para editar"
          >{{ flowName }}</span>
          <button
            class="header-edit-btn"
            @click="startFlowNameEdit"
            title="Editar nome do fluxo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </template>
      </div>
      <div class="header-right">
        <button class="header-btn header-btn-secondary" @click="handleBack">
          <span>Voltar</span>
        </button>
        <button class="header-btn header-btn-primary" @click="handleSave">
          <span>Salvar</span>
        </button>
      </div>
    </header>

    <!-- Main Flow Container -->
    <div class="flow-builder-container" :style="containerStyle" :class="{ 'read-only': isReadOnly }">
      <!-- Loading State -->
      <div v-if="!vueFlowLoaded" class="flow-loading-state">
        <div v-if="vueFlowError" class="flow-error">
          <span>Erro ao carregar Vue Flow: {{ vueFlowError }}</span>
        </div>
        <div v-else class="flow-loading">
          <div class="loading-spinner"></div>
          <span>Carregando editor de fluxo...</span>
        </div>
      </div>

      <!-- Vue Flow Component -->
      <component
        v-if="vueFlowLoaded && VueFlow"
        :is="VueFlow"
        :id="vueFlowId"
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :default-edge-options="defaultEdgeOptions"
        :default-viewport="defaultViewport"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :snap-to-grid="snapToGrid"
        :snap-grid="snapGrid"
        :fit-view-on-init="fitViewOnInit"
        :pan-on-drag="panOnDrag"
        :zoom-on-scroll="zoomOnScroll"
        :connection-mode="connectionMode"
        :delete-key-code="null"
        :nodes-draggable="false"
        class="flow-canvas"
        @node-click="handleNodeClick"
        @edge-click="handleEdgeClick"
        @node-drag-stop="handleNodeDragStop"
        @connect="handleConnect"
        @nodes-change="handleNodesChange"
        @edges-change="handleEdgesChange"
        @viewport-change="handleViewportChange"
        @pane-ready="handlePaneReady"
        @pane-click="handlePaneClick"
      >
        <!-- Custom Node Templates -->
        <template #node-trigger="nodeProps">
          <TriggerNode
            v-bind="nodeProps"
            :status-options="statusOptions"
            @add-node="handleOpenAddNodeMenu"
          />
        </template>

        <template #node-send_sms="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="send_sms"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <template #node-send_whatsapp="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="send_whatsapp"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <template #node-send_email="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="send_email"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <template #node-delay="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="delay"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <template #node-condition="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="condition"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <template #node-criar_cashback="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="criar_cashback"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <template #node-conditional_branch="nodeProps">
          <ConditionalBranchNode
            v-bind="nodeProps"
            @add-node="handleOpenAddNodeMenu"
          />
        </template>

        <template #node-default="nodeProps">
          <ActionNode
            v-bind="nodeProps"
            type="default"
            @add-node="handleOpenAddNodeMenu"
            @delete-node="handleDeleteNode"
          />
        </template>

        <!-- Background -->
        <component
          v-if="Background"
          :is="Background"
          :pattern-color="backgroundPatternColor"
          :gap="backgroundGap"
          :size="backgroundSize"
        />

        <!-- Controls -->
        <component
          v-if="showControls && Controls"
          :is="Controls"
          :show-zoom="showZoomControls"
          :show-fit-view="showFitView"
          :show-interactive="showInteractive"
        />

        <!-- Minimap -->
        <component
          v-if="showMinimap && MiniMap"
          :is="MiniMap"
          :pannable="minimapPannable"
          :zoomable="minimapZoomable"
          :node-color="getNodeColor"
        />
      </component>
    </div>

    <!-- Add Node Sidebar (Inside Canvas) -->
    <transition name="sidebar-slide">
      <div
        v-if="showAddNodeMenu && !isReadOnly"
        class="add-node-sidebar"
      >
        <div class="sidebar-header">
          <h3>Adicionar Ação</h3>
          <button @click="closeAddNodeMenu" class="close-btn" title="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="sidebar-content">
          <button
            v-for="nodeType in availableNodeTypes"
            :key="nodeType.type"
            @click="handleSelectNodeTypeFromMenu(nodeType.type)"
            class="sidebar-item"
            :class="`sidebar-item-${nodeType.type}`"
          >
            <span
              class="sidebar-icon"
              :style="{ color: nodeType.color }"
              v-html="nodeType.icon"
            ></span>
            <span class="sidebar-label">{{ nodeType.label }}</span>
            <span class="sidebar-handle">⋮⋮</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay to close sidebar when clicking outside -->
    <transition name="fade">
      <div
        v-if="showAddNodeMenu"
        class="sidebar-overlay"
        @click="closeAddNodeMenu"
      ></div>
    </transition>

    <!-- Config Panel (Right Side - Inside Wrapper) -->
    <!-- Note: Don't show config panel for conditional_branch nodes (Sim/Não) -->
    <transition name="panel-slide">
      <NodeConfigPanel
        v-if="showConfigPanel && currentSelectedNode && currentSelectedNode.type !== 'conditional_branch'"
        :node="currentSelectedNode"
        :status-options="statusOptions"
        :sms-templates="smsTemplates"
        :whatsapp-templates="whatsappTemplates"
        :email-templates="emailTemplates"
        :position="configPanelPosition"
        :width="configPanelWidth"
        class="config-panel-right"
        @update-config="handleUpdateNodeConfig"
        @close="handleCloseConfigPanel"
        @delete-node="handleDeleteNode"
      />
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDeleteNode">
        <div class="modal-container">
          <h3 class="modal-title">Excluir ação</h3>
          <p class="modal-message">
            Você está prestes a excluir <strong>{{ getNodeDisplayName(nodeToDelete) }}</strong>.
            Como resultado, esta ação será removida do fluxo. Esta ação não pode ser desfeita.
          </p>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-cancel" @click="cancelDeleteNode">
              Cancelar
            </button>
            <button class="modal-btn modal-btn-danger" @click="confirmDeleteNode">
              Excluir {{ getNodeDisplayName(nodeToDelete) }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Back Confirmation Modal -->
    <transition name="fade">
      <div v-if="showBackConfirm" class="modal-overlay" @click.self="cancelBack">
        <div class="modal-container">
          <h3 class="modal-title">Sair sem salvar?</h3>
          <p class="modal-message">
            Suas alterações ainda não foram salvas. Se você sair agora, todas as mudanças serão perdidas.
          </p>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-cancel" @click="cancelBack">
              Continuar editando
            </button>
            <button class="modal-btn modal-btn-danger" @click="confirmBack">
              Sair sem salvar
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Save Confirmation Modal -->
    <transition name="fade">
      <div v-if="showSaveConfirm" class="modal-overlay" @click.self="!isSaving && cancelSave()">
        <div class="modal-container">
          <h3 class="modal-title">Salvar fluxo</h3>
          <p class="modal-message">
            Você está prestes a salvar o fluxo <strong>"{{ flowName }}"</strong>.
            <template v-if="loadedFluxoId">
              As alterações serão aplicadas ao fluxo existente.
            </template>
            <template v-else>
              Um novo fluxo será criado.
            </template>
          </p>
          <div class="modal-footer">
            <button
              class="modal-btn modal-btn-cancel"
              @click="cancelSave"
              :disabled="isSaving"
            >
              Cancelar
            </button>
            <button
              class="modal-btn modal-btn-primary"
              @click="confirmSave"
              :disabled="isSaving"
            >
              <template v-if="isSaving">
                <span class="btn-loader"></span>
                Salvando...
              </template>
              <template v-else>
                Salvar fluxo
              </template>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Import custom nodes
import TriggerNode from './components/nodes/TriggerNode.vue'
import ActionNode from './components/nodes/ActionNode.vue'
import ConditionalBranchNode from './components/nodes/ConditionalBranchNode.vue'
import NodeConfigPanel from './components/NodeConfigPanel.vue'

// Import utilities
import { validateFlowStructure, validateNodeConfig } from './utils/nodeValidation.js'
import {
  convertNodesToAcoes,
  convertAcoesToNodes,
  getTriggerConfig,
  generateFluxoPayload,
  validateFlowForExport
} from './utils/flowConverter.js'

// Vue Flow components - will be loaded dynamically
const vueFlowLoaded = ref(false)
const vueFlowError = ref(null)

// Reactive references for Vue Flow components
const VueFlowComponent = shallowRef(null)
const BackgroundComponent = shallowRef(null)
const ControlsComponent = shallowRef(null)
const MiniMapComponent = shallowRef(null)
const vueFlowInstance = shallowRef(null)

// Store dagre reference
let dagreLib = null

// Load Vue Flow libraries from CDN using script tags
const loadVueFlowFromCDN = async () => {
  const doc = wwLib.getFrontDocument()
  const win = wwLib.getFrontWindow()

  if (!doc || !win) {
    throw new Error('Could not access document or window')
  }

  // Helper to load a script
  const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
      if (doc.getElementById(id)) {
        console.log(`[FLOW-BUILDER] Script ${id} already exists, skipping`)
        resolve()
        return
      }

      const script = doc.createElement('script')
      script.id = id
      script.src = src
      script.onload = () => {
        console.log(`[FLOW-BUILDER] Script ${id} loaded successfully`)
        resolve()
      }
      script.onerror = (e) => {
        console.error(`[FLOW-BUILDER] Script ${id} failed to load:`, e)
        reject(new Error('Failed to load: ' + src))
      }
      doc.head.appendChild(script)
    })
  }

  // Helper to load CSS
  const loadCSS = (href, id) => {
    if (doc.getElementById(id)) return
    const link = doc.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    doc.head.appendChild(link)
  }

  try {
    // Load CSS files
    loadCSS('https://unpkg.com/@vue-flow/core@1.33.5/dist/style.css', 'vue-flow-core-css')
    loadCSS('https://unpkg.com/@vue-flow/core@1.33.5/dist/theme-default.css', 'vue-flow-theme-css')
    loadCSS('https://unpkg.com/@vue-flow/controls@1.1.3/dist/style.css', 'vue-flow-controls-css')
    loadCSS('https://unpkg.com/@vue-flow/minimap@1.4.0/dist/style.css', 'vue-flow-minimap-css')
    console.log('[FLOW-BUILDER] CSS files loaded')

    // Check current Vue status
    console.log('[FLOW-BUILDER] Current win.Vue:', win.Vue)
    console.log('[FLOW-BUILDER] Current win.Vue type:', typeof win.Vue)

    // DO NOT load Vue from CDN - use WeWeb's Vue to avoid conflicts
    // The Vue Flow IIFE should use the existing Vue from WeWeb
    if (!win.Vue) {
      console.log('[FLOW-BUILDER] No Vue found, loading from CDN as fallback')
      await loadScript('https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js', 'vue-global')
    } else {
      console.log('[FLOW-BUILDER] Using existing Vue from WeWeb')
    }

    console.log('[FLOW-BUILDER] Final win.Vue:', win.Vue)

    // Load dagre
    await loadScript('https://unpkg.com/@dagrejs/dagre@1.1.4/dist/dagre.min.js', 'dagre-lib')
    dagreLib = win.dagre
    console.log('[FLOW-BUILDER] Dagre loaded:', dagreLib ? 'success' : 'failed')

    // Load Vue Flow core
    console.log('[FLOW-BUILDER] Loading Vue Flow core...')
    await loadScript('https://unpkg.com/@vue-flow/core@1.33.5/dist/vue-flow-core.iife.js', 'vue-flow-core')

    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('[FLOW-BUILDER] After VueFlow load - win.VueFlow:', win.VueFlow)
    const vueKeys = Object.keys(win).filter(k => k.toLowerCase().includes('vue') || k.toLowerCase().includes('flow'))
    console.log('[FLOW-BUILDER] All window keys with vue/flow:', vueKeys)
    vueKeys.forEach(k => console.log(`[FLOW-BUILDER] win.${k}:`, win[k]))

    // Try alternative global names that Vue Flow might use
    const possibleNames = ['VueFlow', 'vueFlow', 'VueFlowCore', 'vueFlowCore', '@vue-flow/core']
    possibleNames.forEach(name => {
      if (win[name]) {
        console.log(`[FLOW-BUILDER] Found under win.${name}:`, win[name])
      }
    })

    // VueFlow exports to window.VueFlowCore (not VueFlow)
    const vfCore = win.VueFlowCore || win.VueFlow
    console.log('[FLOW-BUILDER] VueFlowCore module:', vfCore)

    if (vfCore) {
      // The module exports VueFlow as a named export
      VueFlowComponent.value = vfCore.VueFlow
      window.__vueFlowHandle = vfCore.Handle
      window.__vueFlowPosition = vfCore.Position
      vueFlowInstance.value = vfCore
      console.log('[FLOW-BUILDER] VueFlow component assigned:', VueFlowComponent.value)
      console.log('[FLOW-BUILDER] Handle:', vfCore.Handle)
      console.log('[FLOW-BUILDER] Position:', vfCore.Position)
    } else {
      throw new Error('VueFlowCore not found after loading script')
    }

    // Load additional components
    await loadScript('https://unpkg.com/@vue-flow/background@1.3.2/dist/vue-flow-background.iife.js', 'vue-flow-bg')
    if (win.VueFlowBackground) {
      BackgroundComponent.value = win.VueFlowBackground.Background
    }

    await loadScript('https://unpkg.com/@vue-flow/controls@1.1.3/dist/vue-flow-controls.iife.js', 'vue-flow-ctrl')
    if (win.VueFlowControls) {
      ControlsComponent.value = win.VueFlowControls.Controls
    }

    await loadScript('https://unpkg.com/@vue-flow/minimap@1.4.0/dist/vue-flow-minimap.iife.js', 'vue-flow-mm')
    if (win.VueFlowMinimap) {
      MiniMapComponent.value = win.VueFlowMinimap.MiniMap
    }

    console.log('[FLOW-BUILDER] All Vue Flow components loaded successfully')
    console.log('[FLOW-BUILDER] Components:', {
      VueFlow: !!VueFlowComponent.value,
      Background: !!BackgroundComponent.value,
      Controls: !!ControlsComponent.value,
      MiniMap: !!MiniMapComponent.value,
      Handle: !!window.__vueFlowHandle,
      Position: !!window.__vueFlowPosition
    })

    vueFlowLoaded.value = true

  } catch (error) {
    console.error('[FLOW-BUILDER] Failed to load Vue Flow:', error)
    vueFlowError.value = error.message
    throw error
  }
}

// Computed aliases for template
const VueFlow = computed(() => VueFlowComponent.value)
const Background = computed(() => BackgroundComponent.value)
const Controls = computed(() => ControlsComponent.value)
const MiniMap = computed(() => MiniMapComponent.value)

// useVueFlow wrapper - will be called after libraries are loaded
const getVueFlowComposable = () => {
  const win = wwLib.getFrontWindow()
  const vfCore = win?.VueFlowCore || win?.VueFlow
  if (vfCore?.useVueFlow) {
    return vfCore.useVueFlow()
  }
  if (vueFlowInstance.value?.useVueFlow) {
    return vueFlowInstance.value.useVueFlow()
  }
  return { fitView: () => {}, setViewport: () => {}, getViewport: () => ({}) }
}

// ConnectionMode
const getConnectionMode = () => {
  const win = wwLib.getFrontWindow()
  const vfCore = win?.VueFlowCore || win?.VueFlow
  if (vfCore?.ConnectionMode) {
    return vfCore.ConnectionMode
  }
  if (vueFlowInstance.value?.ConnectionMode) {
    return vueFlowInstance.value.ConnectionMode
  }
  return { Loose: 'loose', Strict: 'strict' }
}

// Dagre getter
const getDagre = () => dagreLib

const props = defineProps({
  content: { type: Object, default: () => ({}) },
  uid: { type: String, required: true },
  /* wwEditor:start */
  wwEditorState: { type: Object, required: true },
  /* wwEditor:end */
})

const emit = defineEmits(['trigger-event'])

// ============================================
// VUE FLOW INSTANCE
// ============================================

// Unique ID for this VueFlow instance
const vueFlowId = `flow-builder-${props.uid || 'default'}`

// VueFlow composable - initialized after libraries load
let vueFlowComposable = { fitView: () => {}, setViewport: () => {}, getViewport: () => ({}) }

const fitView = (...args) => vueFlowComposable.fitView?.(...args)
const setViewport = (...args) => vueFlowComposable.setViewport?.(...args)
const getViewport = (...args) => vueFlowComposable.getViewport?.(...args)

// ============================================
// NODE TYPES CONFIGURATION
// ============================================

const nodeTypes = {}

// ============================================
// EDGE CONFIGURATION
// ============================================

const defaultEdgeOptions = computed(() => ({
  type: 'smoothstep',
  animated: false,
  style: {
    stroke: '#d1d5db',
    strokeWidth: 2,
  },
  labelStyle: {
    fill: '#6b7280',
    fontSize: 12,
    fontWeight: 500,
  },
  labelBgStyle: {
    fill: '#ffffff',
  },
}))

// ============================================
// INTERNAL VARIABLES (WEWEB)
// ============================================

const { value: selectedNodesVar, setValue: setSelectedNodes } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'selectedNodes',
  type: 'array',
  defaultValue: [],
})

const { value: selectedEdgesVar, setValue: setSelectedEdges } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'selectedEdges',
  type: 'array',
  defaultValue: [],
})

const { value: currentViewport, setValue: setCurrentViewport } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'viewport',
  type: 'object',
  defaultValue: { x: 0, y: 0, zoom: 0.6 },
})

const { value: nodesData, setValue: setNodesData } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'nodes',
  type: 'array',
  defaultValue: [],
})

const { value: edgesData, setValue: setEdgesData } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'edges',
  type: 'array',
  defaultValue: [],
})

const { value: nodeCount, setValue: setNodeCount } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'nodeCount',
  type: 'number',
  defaultValue: 0,
})

const { value: edgeCount, setValue: setEdgeCount } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'edgeCount',
  type: 'number',
  defaultValue: 0,
})

const { value: selectedNodeVar, setValue: setSelectedNode } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'selectedNode',
  type: 'object',
  defaultValue: null,
})

const { value: isValidVar, setValue: setIsValid } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'isValid',
  type: 'boolean',
  defaultValue: false,
})

const { value: validationErrorsVar, setValue: setValidationErrors } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'validationErrors',
  type: 'array',
  defaultValue: [],
})

const { value: triggerConfigVar, setValue: setTriggerConfig } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'triggerConfig',
  type: 'object',
  defaultValue: { status_from: '', status_to: '' },
})

const { value: exportedAcoesVar, setValue: setExportedAcoes } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'exportedAcoes',
  type: 'array',
  defaultValue: [],
})

// ============================================
// REACTIVE NODES & EDGES
// ============================================

const nodes = ref([])
const edges = ref([])
const vueFlowReady = ref(false)
const currentSelectedNode = ref(null)

// Delete confirmation modal state
const showDeleteConfirm = ref(false)
const nodeToDelete = ref(null)

// Back confirmation modal state
const showBackConfirm = ref(false)

// Save confirmation modal state
const showSaveConfirm = ref(false)
const isSaving = ref(false)

const isFlowValid = ref(false)
const showAddNodeMenu = ref(false)
const addNodeMenuSourceId = ref(null)

// ============================================
// COMPUTED PROPERTIES
// ============================================

// Read only mode
const isReadOnly = computed(() => props.content?.readOnly ?? false)

// Status options
const statusOptions = computed(() => {
  return props.content?.statusOptions || [
    { value: 'aberto', label: 'Aberto' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'concluido', label: 'Concluído' },
  ]
})

// Flow name - use internal variable so it persists edits
const { value: flowNameVar, setValue: setFlowName } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'flowName',
  type: 'string',
  defaultValue: 'Novo Fluxo',
})

// Initialize flow name from props and watch for external changes
const flowName = computed(() => flowNameVar.value || 'Novo Fluxo')

// Sync with props.content.flowName when it changes externally
watch(() => props.content?.flowName, (newName) => {
  if (newName && newName !== flowNameVar.value) {
    setFlowName(newName)
  }
}, { immediate: true })

// Logo URL for header (WeWeb returns relative paths, need to prefix with CDN)
const logoUrl = computed(() => {
  const url = props.content?.logoUrl
  if (!url) return ''

  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Otherwise, prefix with WeWeb CDN base URL
  return `https://cdn.weweb.io/${url}`
})
const logoError = ref(false)

// Reset logo error when URL changes
watch(() => props.content?.logoUrl, () => {
  logoError.value = false
})

// Editable flow name state
const isEditingFlowName = ref(false)
const editableFlowName = ref('')
const flowNameInputRef = ref(null)

const startFlowNameEdit = () => {
  editableFlowName.value = flowName.value
  isEditingFlowName.value = true
  nextTick(() => {
    flowNameInputRef.value?.focus()
    flowNameInputRef.value?.select()
  })
}

const handleFlowNameBlur = () => {
  const newName = editableFlowName.value.trim()
  const oldName = flowName.value

  if (newName && newName !== oldName) {
    // Update the internal variable immediately
    setFlowName(newName)

    // Emit event for external handling (e.g., saving to database)
    emit('trigger-event', {
      name: 'flowNameChange',
      event: { oldName, newName }
    })
  }
  isEditingFlowName.value = false
}

const cancelFlowNameEdit = () => {
  isEditingFlowName.value = false
  editableFlowName.value = flowName.value
}

// Empresa ID - Fetch from user/empresa collection
const empresaId = computed(() => {
  try {
    const collections = wwLib.$store.getters['data/getCollections']
    return collections?.['2a7ebac6-154a-4af7-8337-411e42e6a35c']?.data?.[0]?.empresa || null
  } catch (e) {
    console.warn('[FLOW-BUILDER] Erro ao buscar empresaId:', e)
    return null
  }
})

// Templates - Fetch from collection directly via store
const messageTemplates = computed(() => {
  try {
    const collections = wwLib.$store.getters['data/getCollections']
    const templates = collections?.['a6bcc3c7-09e8-4bd9-9b2d-9ddafce96275']?.data
    return Array.isArray(templates) ? templates : []
  } catch (e) {
    return []
  }
})

const smsTemplates = computed(() => {
  return messageTemplates.value.filter(t => t?.tipo === 'sms')
})

const whatsappTemplates = computed(() => {
  return messageTemplates.value.filter(t => t?.tipo === 'whatsapp')
})

const emailTemplates = computed(() => {
  return messageTemplates.value.filter(t => t?.tipo === 'email')
})

// Wrapper style (includes config panel)
const wrapperStyle = computed(() => ({
  // Styles now handled by CSS class for full-page layout
}))

// Container style
const containerStyle = computed(() => ({
  flex: 1,
  minHeight: 0,
  backgroundColor: props.content?.backgroundColor || '#f8fafc',
  borderRadius: '0',
  border: props.content?.showBorder ? `1px solid ${props.content?.borderColor || '#e2e8f0'}` : 'none',
  overflow: 'hidden',
}))

// Vue Flow configuration
// Default viewport with reasonable zoom (0.8) to show nodes at a comfortable size
const defaultViewport = computed(() => ({
  x: props.content?.initialViewportX ?? 100,
  y: props.content?.initialViewportY ?? 50,
  zoom: props.content?.initialZoom ?? 0.8,
}))

const minZoom = computed(() => props.content?.minZoom || 0.25)
const maxZoom = computed(() => props.content?.maxZoom || 4)
const snapToGrid = computed(() => props.content?.snapToGrid ?? true)
const snapGrid = computed(() => [
  props.content?.snapGridX || 20,
  props.content?.snapGridY || 20,
])
// IMPORTANT: We disable fitViewOnInit and handle it manually in handlePaneReady
// to control maxZoom and prevent excessive zoom-in with few nodes
const fitViewOnInit = computed(() => false)
const panOnDrag = computed(() => props.content?.panOnDrag ?? true)
const zoomOnScroll = computed(() => props.content?.zoomOnScroll ?? true)
const connectionMode = computed(() => {
  const cm = getConnectionMode()
  return props.content?.connectionMode === 'strict' ? cm.Strict : cm.Loose
})

// Background configuration
const backgroundPatternColor = computed(() => props.content?.backgroundPatternColor || '#e2e8f0')
const backgroundGap = computed(() => props.content?.backgroundGap || 20)
const backgroundSize = computed(() => props.content?.backgroundSize || 1)

// Controls configuration
const showControls = computed(() => props.content?.showControls ?? true)
const showZoomControls = computed(() => props.content?.showZoomControls ?? true)
const showFitView = computed(() => props.content?.showFitView ?? true)
const showInteractive = computed(() => props.content?.showInteractive ?? true)

// Minimap configuration
const showMinimap = computed(() => props.content?.showMinimap ?? true)
const minimapPannable = computed(() => props.content?.minimapPannable ?? true)
const minimapZoomable = computed(() => props.content?.minimapZoomable ?? true)

// UI visibility
const showToolbar = computed(() => props.content?.showToolbar ?? true)
const showStatusPanel = computed(() => props.content?.showStatusPanel ?? true)
const showActionButtons = computed(() => props.content?.showActionButtons ?? true)
const showConfigPanel = computed(() => props.content?.showConfigPanel ?? true)
const configPanelPosition = computed(() => props.content?.configPanelPosition || 'right')
const configPanelWidth = computed(() => props.content?.configPanelWidth || '320px')

// Default new node type
const defaultNewNodeType = computed(() => props.content?.defaultNewNodeType || 'send_sms')

// Available node types for sidebar
const availableNodeTypes = [
  {
    type: 'send_sms',
    label: 'SMS',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    color: '#10b981'
  },
  {
    type: 'send_whatsapp',
    label: 'WhatsApp',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    color: '#10b981'
  },
  {
    type: 'send_email',
    label: 'E-mail',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    color: '#3b82f6'
  },
  {
    type: 'delay',
    label: 'Aguardar',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    color: '#7c3aed'
  },
  {
    type: 'condition',
    label: 'Condição',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="3" r="2" fill="currentColor"></circle><path d="M12 5v7"></path><path d="M12 12h-6v6"></path><path d="M12 12h6v6"></path><circle cx="6" cy="20" r="2" fill="currentColor"></circle><circle cx="18" cy="20" r="2" fill="currentColor"></circle></svg>',
    color: '#7c3aed'
  },
  {
    type: 'criar_cashback',
    label: 'Criar Cashback',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    color: '#f59e0b'
  },
]

// ============================================
// INITIAL NODES & EDGES PROCESSING
// ============================================

const processInitialNodes = () => {
  const initialNodes = props.content?.initialNodes || []

  if (Array.isArray(initialNodes) && initialNodes.length > 0) {
    return initialNodes.map(node => ({
      id: node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: node.type || 'default',
      position: node.position || { x: 0, y: 0 },
      data: node.data || { label: 'Node', config: {} },
      draggable: node.type === 'trigger' ? false : (node.draggable ?? true),
      selectable: node.selectable ?? true,
      connectable: node.connectable ?? true,
    }))
  }

  // Default: create initial trigger node
  return [{
    id: 'trigger_1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: {
      label: 'Gatilho',
      config: { status_from: '', status_to: '' },
      ordem: 0,
      valid: false,
      errors: ['status_to e obrigatorio'],
    },
    draggable: false,
    selectable: true,
    connectable: true,
  }]
}

const processInitialEdges = () => {
  const initialEdges = props.content?.initialEdges || []

  if (Array.isArray(initialEdges) && initialEdges.length > 0) {
    return initialEdges.map(edge => ({
      id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      animated: false,
      label: edge.label || '',
    }))
  }

  return []
}

// ============================================
// NODE ADDITION LOGIC
// ============================================

const generateNodeId = () => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateEdgeId = (source, target) => {
  return `edge_${source}_${target}`
}

// Calculate approximate height of a node based on its type and state
const getNodeHeight = (node) => {
  if (!node) return 150 // Default fallback

  const baseHeights = {
    trigger: 180,           // TriggerNode base height
    send_sms: 160,          // ActionNode with SMS
    send_whatsapp: 160,     // ActionNode with WhatsApp
    send_email: 160,        // ActionNode with Email
    delay: 160,             // ActionNode with Delay
    condition: 160,         // ActionNode with Condition
    criar_cashback: 180,    // ActionNode with Cashback (more content)
    conditional_branch: 30, // ConditionalBranchNode (minimal - just label)
    default: 160,           // Default ActionNode
  }

  let height = baseHeights[node.type] || 150

  // Add extra height if node has errors
  if (node.data?.errors && node.data.errors.length > 0) {
    height += 40 // Error message section adds ~40px
  }

  // Add extra height if node is invalid (validation badge + error message)
  if (node.data?.valid === false && !node.data?.errors?.length) {
    height += 40
  }

  return height
}

// Calculate width of a node based on its type
const getNodeWidth = (node) => {
  if (!node) return 280 // Default fallback

  const nodeWidths = {
    trigger: 280,           // TriggerNode width
    send_sms: 280,          // ActionNode width
    send_whatsapp: 280,     // ActionNode width
    send_email: 280,        // ActionNode width
    delay: 280,             // ActionNode width
    condition: 280,         // ActionNode width
    criar_cashback: 280,    // ActionNode width
    conditional_branch: 60, // ConditionalBranchNode (minimal - just label)
    default: 280,           // Default ActionNode width
  }

  return nodeWidths[node.type] || 280
}

// Find all descendants of a node (entire subtree)
const findAllDescendants = (nodeId) => {
  const descendants = []
  const queue = [nodeId]

  while (queue.length > 0) {
    const currentNodeId = queue.shift()

    // Find all outgoing edges from current node
    const outgoingEdges = edges.value.filter(e => e.source === currentNodeId)

    // Add target nodes to descendants and queue
    outgoingEdges.forEach(edge => {
      if (!descendants.includes(edge.target)) {
        descendants.push(edge.target)
        queue.push(edge.target)
      }
    })
  }

  return descendants
}

// ============================================
// AUTOMATIC LAYOUT WITH DAGRE
// ============================================

/**
 * Apply automatic layout using dagre algorithm
 * This calculates optimal positions for all nodes to prevent overlap
 * @param {boolean} shouldFitView - Whether to fit the view after layout (default: false)
 */
const applyAutoLayout = (shouldFitView = false) => {
  if (!nodes.value.length) return

  // Create new dagre graph
  const d = getDagre()
  if (!d) {
    console.warn('[FLOW-BUILDER] Dagre not loaded yet')
    return
  }
  const dagreGraph = new d.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  // Configure layout: top to bottom, with appropriate spacing
  dagreGraph.setGraph({
    rankdir: 'TB',      // Top to Bottom
    nodesep: 80,        // Horizontal separation between nodes
    ranksep: 40,        // Vertical separation between ranks
    marginx: 20,
    marginy: 20,
  })

  // Add all nodes with their dimensions
  nodes.value.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: getNodeWidth(node),
      height: getNodeHeight(node),
    })
  })

  // Add all edges
  edges.value.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Run dagre layout algorithm
  d.layout(dagreGraph)

  // Apply calculated positions back to nodes
  // IMPORTANT: Dagre uses center-center anchoring, Vue Flow uses top-left
  nodes.value.forEach((node) => {
    const dagreNode = dagreGraph.node(node.id)
    if (dagreNode) {
      const nodeWidth = getNodeWidth(node)
      const nodeHeight = getNodeHeight(node)

      node.position = {
        x: dagreNode.x - nodeWidth / 2,
        y: dagreNode.y - nodeHeight / 2,
      }
    }
  })

  // Only fit view on initialization, not when adding/removing nodes
  if (shouldFitView) {
    // Use a small delay to ensure VueFlow is fully rendered
    setTimeout(() => {
      // Find the trigger node to center on it
      const triggerNode = nodes.value.find(n => n.type === 'trigger')
      console.log('[FLOW-BUILDER] applyAutoLayout - triggerNode position:', triggerNode?.position)

      if (triggerNode) {
        // Get canvas container dimensions using WeWeb's document
        const doc = wwLib.getFrontDocument()
        // Try multiple selectors to find the VueFlow container
        const container = doc?.querySelector('.flow-builder-container') ||
                          doc?.querySelector('.vue-flow') ||
                          doc?.querySelector('.flow-canvas')
        const containerWidth = container?.clientWidth || 800
        const containerHeight = container?.clientHeight || 600

        console.log('[FLOW-BUILDER] Container found:', !!container, 'dimensions:', containerWidth, 'x', containerHeight)

        // Calculate viewport position to center trigger horizontally
        const triggerWidth = getNodeWidth(triggerNode)
        const triggerCenterX = triggerNode.position.x + triggerWidth / 2

        // Viewport X: offset needed to move triggerCenterX to containerWidth/2
        const viewportX = (containerWidth / 2) - triggerCenterX
        // Viewport Y: 80px from top, accounting for trigger position
        const viewportY = 80 - triggerNode.position.y

        console.log('[FLOW-BUILDER] Trigger center X:', triggerCenterX, 'triggerWidth:', triggerWidth)
        console.log('[FLOW-BUILDER] Setting viewport:', { x: viewportX, y: viewportY, zoom: 1 })

        // Try setViewport first
        setViewport({ x: viewportX, y: viewportY, zoom: 1 }, { duration: 300 })

        // Verify it was applied after a short delay
        setTimeout(() => {
          const currentViewport = getViewport()
          console.log('[FLOW-BUILDER] Current viewport after setViewport:', currentViewport)
        }, 400)
      } else {
        // Fallback to fitView if no trigger
        console.log('[FLOW-BUILDER] No trigger found, using fitView')
        fitView({ duration: 300, padding: 0.2, maxZoom: 1 })
      }
    }, 100)
  }
}

const addNewNodeAfter = (sourceNodeId, sourceNodeType) => {
  // Find source node
  const sourceNode = nodes.value.find(n => n.id === sourceNodeId)
  if (!sourceNode) return

  // Find any outgoing edge
  const existingOutgoingEdge = edges.value.find(e => e.source === sourceNodeId)
  const existingTargetNode = existingOutgoingEdge
    ? nodes.value.find(n => n.id === existingOutgoingEdge.target)
    : null

  // Generate IDs
  const newNodeId = generateNodeId()
  const newNodeType = sourceNodeType || defaultNewNodeType.value

  // Create new node with temporary position (dagre will calculate the real position)
  const newNode = {
    id: newNodeId,
    type: newNodeType,
    position: { x: 0, y: 0 }, // Temporary - will be set by applyAutoLayout
    data: {
      label: getNodeLabel(newNodeType),
      config: getDefaultConfig(newNodeType),
      ordem: nodes.value.length,
      valid: false,
      errors: [],
    },
    draggable: true,
    selectable: true,
    connectable: true,
  }

  // Prepare edges and nodes to add
  const edgesToAdd = []
  const nodesToAdd = [newNode]

  // SPECIAL HANDLING: If creating a condition node, automatically create two branch nodes
  if (newNodeType === 'condition') {
    // Create "Sim" (true) branch node
    const simBranchId = generateNodeId()
    const simBranchNode = {
      id: simBranchId,
      type: 'conditional_branch',
      position: { x: 0, y: 0 }, // Temporary - will be set by applyAutoLayout
      data: {
        label: 'Sim',
        branchType: 'true',
        ordem: nodes.value.length + 1,
      },
      draggable: true,
      selectable: true,
      connectable: true,
    }
    nodesToAdd.push(simBranchNode)

    // Create "Não" (false) branch node
    const naoBranchId = generateNodeId()
    const naoBranchNode = {
      id: naoBranchId,
      type: 'conditional_branch',
      position: { x: 0, y: 0 }, // Temporary - will be set by applyAutoLayout
      data: {
        label: 'Não',
        branchType: 'false',
        ordem: nodes.value.length + 2,
      },
      draggable: true,
      selectable: true,
      connectable: true,
    }
    nodesToAdd.push(naoBranchNode)

    // Create edges from condition node to branch nodes
    edgesToAdd.push({
      id: generateEdgeId(newNodeId, simBranchId),
      source: newNodeId,
      target: simBranchId,
      type: 'smoothstep',
      animated: false,
    })

    edgesToAdd.push({
      id: generateEdgeId(newNodeId, naoBranchId),
      source: newNodeId,
      target: naoBranchId,
      type: 'smoothstep',
      animated: false,
    })
  }

  // Create edge from source to new node
  const sourceToNewEdge = {
    id: generateEdgeId(sourceNodeId, newNodeId),
    source: sourceNodeId,
    target: newNodeId,
    type: 'smoothstep',
    animated: false,
  }
  edgesToAdd.push(sourceToNewEdge)

  // If there was an existing target and this is NOT a condition node,
  // connect new node to existing target
  let newToTargetEdge = null
  if (existingOutgoingEdge && existingTargetNode && newNodeType !== 'condition') {
    newToTargetEdge = {
      id: generateEdgeId(newNodeId, existingTargetNode.id),
      source: newNodeId,
      target: existingTargetNode.id,
      type: 'smoothstep',
      animated: false,
    }
    edgesToAdd.push(newToTargetEdge)
  }

  // Update nodes array
  nodes.value = [...nodes.value, ...nodesToAdd]

  // Update edges array - remove old edge if exists, add new edges
  let updatedEdges = [...edges.value]
  if (existingOutgoingEdge) {
    updatedEdges = updatedEdges.filter(e => e.id !== existingOutgoingEdge.id)
  }
  updatedEdges = [...updatedEdges, ...edgesToAdd]
  edges.value = updatedEdges

  // APPLY AUTOMATIC LAYOUT - this handles all positioning
  applyAutoLayout()

  // Update internal variables
  updateInternalVariables()
  runValidation()

  // Select the new node and open config panel immediately
  // Use nextTick to ensure the node is rendered before selecting
  nextTick(() => {
    const addedNode = nodes.value.find(n => n.id === newNodeId)
    if (addedNode && addedNode.type !== 'conditional_branch') {
      currentSelectedNode.value = addedNode
      setSelectedNodes([addedNode])
      setSelectedNode(addedNode)
    }
  })

  // Emit trigger event
  emit('trigger-event', {
    name: 'node-added',
    event: {
      node: newNode,
      sourceToNewEdge,
      newToTargetEdge,
      removedEdge: existingOutgoingEdge || null,
      sourceNodeId,
      insertedBetween: existingTargetNode ? {
        sourceId: sourceNodeId,
        targetId: existingTargetNode.id,
      } : null,
    },
  })
}

const getNodeLabel = (type) => {
  const labels = {
    trigger: 'Gatilho',
    send_sms: 'Enviar SMS',
    send_whatsapp: 'Enviar WhatsApp',
    send_email: 'Enviar E-mail',
    delay: 'Aguardar',
    condition: 'Condicao',
    criar_cashback: 'Criar Cashback',
    default: 'Acao',
  }
  return labels[type] || 'Acao'
}

const getDefaultConfig = (type) => {
  const configs = {
    trigger: { status_from: '', status_to: '' },
    send_sms: { origem: 'custom', mensagem: '', variaveis: {} },
    send_whatsapp: { origem: 'custom', mensagem: '', variaveis: {}, media_url: '' },
    send_email: { origem: 'custom', assunto: '', mensagem_html: '', de_nome: '', de_email: '', variaveis: {} },
    delay: { tipo: null, valor: null },
    condition: { campo: '', operador: '=', valor: '', tipo_campo: 'string', acao_verdadeiro: 'continuar', acao_falso: 'continuar' },
    criar_cashback: { desconto_max_percentual: null, cashback_percentual: null, dias_inicio: null, dias_vencimento: null },
    default: {},
  }
  return configs[type] || {}
}

const getNodeColor = (node) => {
  const colors = {
    trigger: '#667eea',
    send_sms: '#10b981',
    send_whatsapp: '#25d366',
    send_email: '#3b82f6',
    delay: '#f59e0b',
    condition: '#8b5cf6',
    default: '#6b7280',
  }
  return colors[node.type] || '#6b7280'
}

// ============================================
// ADD NODE MENU HANDLERS
// ============================================

const handleOpenAddNodeMenu = (payload) => {
  const { sourceNodeId } = payload

  // Store source node ID
  addNodeMenuSourceId.value = sourceNodeId

  // Show sidebar
  showAddNodeMenu.value = true
}

const closeAddNodeMenu = () => {
  showAddNodeMenu.value = false
  addNodeMenuSourceId.value = null
}

const handleSelectNodeTypeFromMenu = (nodeType) => {
  if (!addNodeMenuSourceId.value) return

  // Add new node after the source node
  addNewNodeAfter(
    addNodeMenuSourceId.value,
    nodeType
  )

  // Close menu
  closeAddNodeMenu()
}

// ============================================
// VALIDATION
// ============================================

const runValidation = () => {
  console.log('[FLOW-BUILDER] runValidation() chamado')
  const errors = []

  // Validate flow structure
  const structureValid = validateFlowStructure(nodes.value, edges.value)
  console.log('[FLOW-BUILDER] validateFlowStructure:', structureValid)
  if (!structureValid) {
    errors.push({ field: 'structure', message: 'Estrutura do fluxo invalida', code: 'INVALID_STRUCTURE' })
  }

  // Validate each node config
  console.log('[FLOW-BUILDER] Validando nodes:', nodes.value.length)
  nodes.value.forEach(node => {
    const validation = validateNodeConfig(node.type, node.data?.config || {})
    console.log(`[FLOW-BUILDER] Node ${node.id} (${node.type}):`, {
      config: node.data?.config,
      valid: validation.valid,
      errors: validation.errors
    })
    node.data.valid = validation.valid
    node.data.errors = validation.errors.map(e => e.message)
    if (!validation.valid) {
      validation.errors.forEach(err => {
        errors.push({ ...err, nodeId: node.id })
      })
    }
  })

  // Must have at least trigger + 1 action
  console.log('[FLOW-BUILDER] Total nodes:', nodes.value.length, '(min: 2)')
  if (nodes.value.length < 2) {
    errors.push({ field: 'nodes', message: 'Fluxo deve ter pelo menos uma acao alem do gatilho', code: 'MIN_NODES' })
  }

  console.log('[FLOW-BUILDER] Total errors:', errors.length)
  console.log('[FLOW-BUILDER] Errors:', errors)

  isFlowValid.value = errors.length === 0
  setIsValid(errors.length === 0)
  setValidationErrors(errors)

  // Update trigger config
  const triggerNode = nodes.value.find(n => n.type === 'trigger')
  if (triggerNode) {
    setTriggerConfig(triggerNode.data?.config || { status_from: '', status_to: '' })
  }

  emit('trigger-event', {
    name: 'validation-changed',
    event: { isValid: isFlowValid.value, errors },
  })

  return isFlowValid.value
}

// ============================================
// EVENT HANDLERS
// ============================================

const handlePaneReady = () => {
  vueFlowReady.value = true
  console.log('[FLOW-BUILDER] handlePaneReady called, vueFlowReady:', vueFlowReady.value)

  // Re-initialize useVueFlow composable now that the instance is ready
  // This ensures setViewport and other methods work correctly
  const win = wwLib.getFrontWindow()
  const vfCore = win?.VueFlowCore || win?.VueFlow
  if (vfCore?.useVueFlow) {
    vueFlowComposable = vfCore.useVueFlow({ id: vueFlowId })
    console.log('[FLOW-BUILDER] useVueFlow re-initialized on pane ready:', vueFlowComposable)
  }

  // Apply layout and fit view when pane is ready
  // This ensures Vue Flow is fully initialized before we fitView
  // Pass true to fit view only on initialization
  nextTick(() => {
    applyAutoLayout(true)
  })
}

const handlePaneClick = () => {
  currentSelectedNode.value = null
  setSelectedNode(null)

  emit('trigger-event', {
    name: 'node-selected',
    event: { node: null },
  })
}

const handleNodeClick = (event) => {
  const { node } = event
  setSelectedNodes([node])
  currentSelectedNode.value = node
  setSelectedNode(node)

  emit('trigger-event', {
    name: 'node-click',
    event: { node },
  })

  emit('trigger-event', {
    name: 'node-selected',
    event: { node },
  })
}

const handleEdgeClick = (event) => {
  const { edge } = event
  setSelectedEdges([edge])

  emit('trigger-event', {
    name: 'edge-click',
    event: { edge },
  })
}

const handleNodeDragStop = (event) => {
  const { node } = event
  updateInternalVariables()

  emit('trigger-event', {
    name: 'node-drag-stop',
    event: { node },
  })
}

const handleConnect = (params) => {
  const newEdge = {
    id: generateEdgeId(params.source, params.target),
    source: params.source,
    target: params.target,
    type: 'smoothstep',
    animated: false,
  }

  edges.value = [...edges.value, newEdge]
  updateInternalVariables()
  runValidation()

  emit('trigger-event', {
    name: 'connect',
    event: { connection: params, edge: newEdge },
  })
}

const handleNodesChange = (changes) => {
  updateInternalVariables()
  runValidation()

  emit('trigger-event', {
    name: 'nodes-change',
    event: { changes },
  })

  emit('trigger-event', {
    name: 'flow-changed',
    event: { nodes: nodes.value, edges: edges.value },
  })
}

const handleEdgesChange = (changes) => {
  updateInternalVariables()
  runValidation()

  emit('trigger-event', {
    name: 'edges-change',
    event: { changes },
  })

  emit('trigger-event', {
    name: 'flow-changed',
    event: { nodes: nodes.value, edges: edges.value },
  })
}

const handleViewportChange = (viewport) => {
  setCurrentViewport(viewport)

  emit('trigger-event', {
    name: 'viewport-change',
    event: { viewport },
  })
}

const handleUpdateNodeConfig = ({ nodeId, config }) => {
  const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
  if (nodeIndex !== -1) {
    nodes.value[nodeIndex].data.config = { ...config }

    // Re-validate this node
    const validation = validateNodeConfig(nodes.value[nodeIndex].type, config)
    nodes.value[nodeIndex].data.valid = validation.valid
    nodes.value[nodeIndex].data.errors = validation.errors.map(e => e.message)

    // Update current selected node
    currentSelectedNode.value = { ...nodes.value[nodeIndex] }
    setSelectedNode(currentSelectedNode.value)

    updateInternalVariables()
    runValidation()

    emit('trigger-event', {
      name: 'node-config-updated',
      event: { nodeId, config },
    })
  }
}

const handleCloseConfigPanel = () => {
  currentSelectedNode.value = null
  setSelectedNode(null)
}

// Header button handlers
const handleBack = () => {
  // Show confirmation modal
  showBackConfirm.value = true
}

const cancelBack = () => {
  showBackConfirm.value = false
}

const confirmBack = () => {
  showBackConfirm.value = false
  emit('trigger-event', {
    name: 'back',
    event: {},
  })
}

// Handle save button click - shows confirmation modal
const handleSave = () => {
  console.log('[FLOW-BUILDER] Clique no botão salvar - validando...')

  // Run validation before showing modal
  runValidation()

  // Validate flow for export
  const exportValidation = validateFlowForExport(nodes.value, edges.value)

  console.log('[FLOW-BUILDER] Validação:')
  console.log('  - isFlowValid:', isFlowValid.value)
  console.log('  - exportValidation.valid:', exportValidation.valid)
  console.log('  - exportValidation.errors:', exportValidation.errors)

  // Check if flow is valid before showing modal
  if (!isFlowValid.value || !exportValidation.valid) {
    console.error('[FLOW-BUILDER] Fluxo inválido, não abrindo modal')
    emit('trigger-event', {
      name: 'save',
      event: {
        success: false,
        error: 'Fluxo inválido. Corrija os erros antes de salvar.',
        validationErrors: [
          ...validationErrorsVar.value,
          ...exportValidation.errors,
        ],
        isValid: false,
      },
    })
    return
  }

  // Check if empresaId is available
  if (!empresaId.value) {
    console.error('[FLOW-BUILDER] empresaId não encontrado!')
    emit('trigger-event', {
      name: 'save',
      event: {
        success: false,
        error: 'ID da empresa não encontrado. Verifique se o usuário está logado.',
        isValid: false,
      },
    })
    return
  }

  // Show confirmation modal
  showSaveConfirm.value = true
}

// Cancel save - close modal
const cancelSave = () => {
  if (!isSaving.value) {
    showSaveConfirm.value = false
  }
}

// Confirm save - perform the actual save
const confirmSave = async () => {
  console.log('========================================')
  console.log('[FLOW-BUILDER] Iniciando save...')
  console.log('========================================')

  isSaving.value = true

  try {
    const currentEmpresaId = empresaId.value

    // Generate payload in the format expected by the RPC
    console.log('[FLOW-BUILDER] Gerando payload...')
    console.log('  - flowName:', flowName.value)

    const payload = generateFluxoPayload({
      nome: flowName.value || 'Novo Fluxo',
      descricao: '',
      nodes: nodes.value,
      edges: edges.value,
      ativo: false,
      permitir_reentrada: false,
      intervalo_reentrada_dias: null,
    })

    console.log('[FLOW-BUILDER] Payload gerado:')
    console.log('  - payload.fluxo:', payload.fluxo)
    console.log('  - payload.acoes:', payload.acoes)

    // Add empresa_id to fluxo payload
    const fluxoPayload = {
      ...payload.fluxo,
      empresa_id: currentEmpresaId,
    }

    // If editing existing flow, add the id
    const fluxoId = loadedFluxoId.value || props.content?.fluxoId
    console.log('[FLOW-BUILDER] fluxoId (para edição):', fluxoId)

    if (fluxoId) {
      fluxoPayload.id = fluxoId
    }

    console.log('[FLOW-BUILDER] fluxoPayload final:', fluxoPayload)

    // Check Supabase plugin availability
    if (!wwLib?.wwPlugins?.supabase?.instance) {
      console.error('[FLOW-BUILDER] Supabase plugin não encontrado!')
      emit('trigger-event', {
        name: 'save',
        event: {
          success: false,
          error: 'Plugin Supabase não encontrado. Verifique se está instalado e configurado.',
          isValid: true,
        },
      })
      return
    }

    // Call RPC function: salvar_fluxo_automacao
    console.log('[FLOW-BUILDER] Chamando RPC salvar_fluxo_automacao...')

    const { data, error } = await wwLib.wwPlugins.supabase.instance.rpc(
      'salvar_fluxo_automacao',
      {
        p_fluxo: fluxoPayload,
        p_acoes: payload.acoes,
      }
    )

    console.log('[FLOW-BUILDER] Resposta RPC:')
    console.log('  - data:', data)
    console.log('  - error:', error)

    if (error) {
      console.error('[FLOW-BUILDER] Erro RPC:', error)
      emit('trigger-event', {
        name: 'save',
        event: {
          success: false,
          error: error.message || 'Erro ao salvar fluxo',
          error_code: error.code,
          error_details: error.details,
          error_hint: error.hint,
          isValid: true,
        },
      })
      return
    }

    // Success!
    console.log('[FLOW-BUILDER] ✅ Fluxo salvo com sucesso!')

    // Update loadedFluxoId if this was a new flow
    if (!fluxoId && data?.fluxo?.id) {
      setLoadedFluxoId(data.fluxo.id)
    }

    emit('trigger-event', {
      name: 'save',
      event: {
        success: data?.success ?? true,
        message: data?.message || 'Fluxo salvo com sucesso!',
        fluxo: data?.fluxo,
        acoes: data?.acoes,
        isValid: true,
        nodes: nodes.value,
        edges: edges.value,
        triggerConfig: triggerConfigVar.value,
      },
    })

    // Close modal on success
    showSaveConfirm.value = false

  } catch (err) {
    console.error('[FLOW-BUILDER] ❌ Erro inesperado ao salvar:', err)
    emit('trigger-event', {
      name: 'save',
      event: {
        success: false,
        error: err?.message || 'Erro inesperado ao salvar fluxo',
        isValid: true,
      },
    })
  } finally {
    isSaving.value = false
    console.log('========================================')
    console.log('[FLOW-BUILDER] Save finalizado')
    console.log('========================================')
  }
}

const handleDeleteNode = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return

  // Don't allow deleting trigger node
  if (node.type === 'trigger') {
    console.warn('Cannot delete trigger node')
    return
  }

  // Show confirmation modal
  nodeToDelete.value = node
  showDeleteConfirm.value = true
}

const cancelDeleteNode = () => {
  showDeleteConfirm.value = false
  nodeToDelete.value = null
}

const getNodeDisplayName = (node) => {
  if (!node) return ''
  const typeLabels = {
    'trigger': 'Gatilho',
    'send_sms': 'Enviar SMS',
    'send_whatsapp': 'Enviar WhatsApp',
    'send_email': 'Enviar E-mail',
    'delay': 'Aguardar',
    'condition': 'Condição',
    'criar_cashback': 'Criar Cashback',
  }
  return typeLabels[node.type] || node.type
}

const confirmDeleteNode = () => {
  if (!nodeToDelete.value) return

  const nodeId = nodeToDelete.value.id
  const node = nodeToDelete.value

  // SPECIAL HANDLING: If deleting a condition node, also delete its branch nodes
  const nodesToDelete = [nodeId]
  if (node.type === 'condition') {
    // Find outgoing edges from this condition node
    const conditionOutgoingEdges = edges.value.filter(e => e.source === nodeId)
    // Find branch nodes connected to this condition
    conditionOutgoingEdges.forEach(edge => {
      const targetNode = nodes.value.find(n => n.id === edge.target)
      if (targetNode && targetNode.type === 'conditional_branch') {
        nodesToDelete.push(targetNode.id)
      }
    })
  }

  // Find edges connected to this node (and branch nodes if applicable)
  const incomingEdges = edges.value.filter(e => e.target === nodeId)
  const outgoingEdges = edges.value.filter(e => e.source === nodeId)

  // Remove the node(s)
  nodes.value = nodes.value.filter(n => !nodesToDelete.includes(n.id))

  // Remove edges connected to deleted nodes
  edges.value = edges.value.filter(e =>
    !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target)
  )

  // If node had both incoming and outgoing edges, reconnect
  if (incomingEdges.length > 0 && outgoingEdges.length > 0) {
    incomingEdges.forEach(inEdge => {
      outgoingEdges.forEach(outEdge => {
        const newEdge = {
          id: generateEdgeId(inEdge.source, outEdge.target),
          source: inEdge.source,
          target: outEdge.target,
          type: 'smoothstep',
          animated: false,
        }
        edges.value = [...edges.value, newEdge]
      })
    })
  }

  // Apply automatic layout after deletion
  applyAutoLayout()

  currentSelectedNode.value = null
  setSelectedNode(null)
  updateInternalVariables()
  runValidation()

  emit('trigger-event', {
    name: 'node-deleted',
    event: { nodeId, nodeType: node.type },
  })

  // Close modal
  showDeleteConfirm.value = false
  nodeToDelete.value = null
}

const handleCloneNode = (nodeId) => {
  // Find the node to clone
  const nodeToClone = nodes.value.find(n => n.id === nodeId)
  if (!nodeToClone) return

  // Generate new ID
  const newNodeId = generateNodeId()

  // Create cloned node with offset position
  const clonedNode = {
    ...nodeToClone,
    id: newNodeId,
    position: {
      x: nodeToClone.position.x + 50,
      y: nodeToClone.position.y + 50,
    },
    data: {
      ...nodeToClone.data,
      label: nodeToClone.data?.label ? `${nodeToClone.data.label} (cópia)` : 'Cópia',
    },
  }

  // Add cloned node
  nodes.value.push(clonedNode)

  // Update counts and validation
  updateInternalVariables()
  runValidation()

  // Emit event
  emit('trigger-event', {
    name: 'node-cloned',
    event: { originalNodeId: nodeId, clonedNodeId: newNodeId },
  })
}

const handleValidate = () => {
  const isValid = runValidation()

  emit('trigger-event', {
    name: 'validate-requested',
    event: { isValid, errors: validationErrorsVar.value },
  })
}

const handleExport = () => {
  if (!isFlowValid.value) {
    console.warn('Cannot export invalid flow')
    return
  }

  // Convert nodes to actions format
  const acoes = convertNodesToAcoes(nodes.value, edges.value)
  const triggerConfig = getTriggerConfig(nodes.value)

  setExportedAcoes(acoes)

  emit('trigger-event', {
    name: 'export-requested',
    event: {
      nodes: nodes.value,
      edges: edges.value,
      acoes,
      triggerConfig,
    },
  })
}

// ============================================
// INTERNAL VARIABLE UPDATES
// ============================================

const updateInternalVariables = () => {
  setNodesData([...nodes.value])
  setEdgesData([...edges.value])
  setNodeCount(nodes.value.length)
  setEdgeCount(edges.value.length)
}

// ============================================
// WATCHERS
// ============================================

// Watch for initial nodes/edges changes
watch(
  () => [props.content?.initialNodes, props.content?.initialEdges],
  () => {
    nodes.value = processInitialNodes()
    edges.value = processInitialEdges()
    updateInternalVariables()
    runValidation()
  },
  { deep: true }
)

// Watch all visual configuration properties
watch(
  () => [
    props.content?.height,
    props.content?.backgroundColor,
    props.content?.borderRadius,
    props.content?.showBorder,
    props.content?.borderColor,
    props.content?.minZoom,
    props.content?.maxZoom,
    props.content?.snapToGrid,
    props.content?.snapGridX,
    props.content?.snapGridY,
    props.content?.fitViewOnInit,
    props.content?.panOnDrag,
    props.content?.zoomOnScroll,
    props.content?.connectionMode,
    props.content?.backgroundPatternColor,
    props.content?.backgroundGap,
    props.content?.backgroundSize,
    props.content?.showControls,
    props.content?.showZoomControls,
    props.content?.showFitView,
    props.content?.showInteractive,
    props.content?.showMinimap,
    props.content?.minimapPannable,
    props.content?.minimapZoomable,
    props.content?.defaultNewNodeType,
    props.content?.showToolbar,
    props.content?.showStatusPanel,
    props.content?.showActionButtons,
    props.content?.showConfigPanel,
    props.content?.configPanelPosition,
    props.content?.configPanelWidth,
    props.content?.readOnly,
    props.content?.statusOptions,
  ],
  () => {
    // Vue Flow handles these reactively through computed properties
    // No additional action needed
  },
  { deep: true }
)

// ============================================
// LIFECYCLE
// ============================================

// Prevent keyboard deletion of nodes
const handleKeyDown = (event) => {
  // Prevent delete/backspace from deleting nodes
  if (event.key === 'Delete' || event.key === 'Backspace') {
    // Check if target is an input, textarea, or contenteditable
    const target = event.target
    const isEditable =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable

    // Only prevent if not in an editable field
    if (!isEditable) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

// State for loaded flow ID (for editing) - exposed as internal variables
const { value: loadedFluxoId, setValue: setLoadedFluxoId } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'loadedFluxoId',
  type: 'number',
  defaultValue: null,
})

const { value: isLoadingFlow, setValue: setIsLoadingFlow } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'isLoadingFlow',
  type: 'boolean',
  defaultValue: false,
})

/**
 * Load existing flow from database by ID
 */
const loadFluxoFromDatabase = async (fluxoId) => {
  const currentEmpresaId = empresaId.value

  if (!currentEmpresaId) {
    console.error('[FLOW-BUILDER] empresaId não encontrado na collection para carregar fluxo')
    return false
  }

  if (!wwLib?.wwPlugins?.supabase?.instance) {
    console.error('[FLOW-BUILDER] Supabase plugin não encontrado')
    return false
  }

  console.log('[FLOW-BUILDER] Carregando fluxo:', { fluxoId, empresaId: currentEmpresaId })
  setIsLoadingFlow(true)

  try {
    const { data, error } = await wwLib.wwPlugins.supabase.instance.rpc(
      'buscar_fluxo_completo',
      {
        p_fluxo_id: parseInt(fluxoId),
        p_empresa_id: currentEmpresaId,
      }
    )

    console.log('[FLOW-BUILDER] Resposta buscar_fluxo_completo:', { data, error })

    if (error) {
      console.error('[FLOW-BUILDER] Erro ao carregar fluxo:', error)
      emit('trigger-event', {
        name: 'load-error',
        event: { error: error.message, fluxoId },
      })
      return false
    }

    if (!data?.success) {
      console.error('[FLOW-BUILDER] Fluxo não encontrado:', data?.error)
      emit('trigger-event', {
        name: 'load-error',
        event: { error: data?.error || 'Fluxo não encontrado', fluxoId },
      })
      return false
    }

    // Store the fluxo ID for saving
    setLoadedFluxoId(data.fluxo?.id)

    // Update flow name
    if (data.fluxo?.nome) {
      setFlowName(data.fluxo.nome)
    }

    // Convert database format to Vue Flow nodes/edges
    const triggerConfig = data.fluxo?.trigger_config || { status_from: '', status_to: '' }
    const { nodes: loadedNodes, edges: loadedEdges } = convertAcoesToNodes(
      data.acoes || [],
      triggerConfig,
      data.primeira_acao_id
    )

    console.log('[FLOW-BUILDER] Nodes/Edges convertidos:', {
      nodes: loadedNodes.length,
      edges: loadedEdges.length
    })

    // Set the nodes and edges
    nodes.value = loadedNodes
    edges.value = loadedEdges

    // Update internal variables
    updateInternalVariables()

    // Apply layout after setting nodes - wait for VueFlow to be ready
    setTimeout(() => {
      if (vueFlowReady.value) {
        console.log('[FLOW-BUILDER] Applying auto layout after loading flow')
        applyAutoLayout(true)
      }
      runValidation()
    }, 200)

    // Emit success event
    emit('trigger-event', {
      name: 'flow-loaded',
      event: {
        fluxo: data.fluxo,
        acoes: data.acoes,
        totalAcoes: data.total_acoes,
      },
    })

    return true

  } catch (err) {
    console.error('[FLOW-BUILDER] Erro inesperado ao carregar fluxo:', err)
    emit('trigger-event', {
      name: 'load-error',
      event: { error: err?.message || 'Erro inesperado', fluxoId },
    })
    return false
  } finally {
    setIsLoadingFlow(false)
  }
}

/**
 * Get query string parameter from URL
 */
const getQueryParam = (param) => {
  try {
    const urlParams = new URLSearchParams(wwLib.getFrontWindow()?.location?.search || '')
    return urlParams.get(param)
  } catch (e) {
    console.warn('[FLOW-BUILDER] Erro ao ler query string:', e)
    return null
  }
}

onMounted(async () => {
  // Load Vue Flow libraries from CDN first
  try {
    await loadVueFlowFromCDN()

    // Initialize useVueFlow composable after libraries are loaded
    // NOTE: We'll re-initialize this in handlePaneReady when the instance is actually ready
    const win = wwLib.getFrontWindow()
    const vfCore = win?.VueFlowCore || win?.VueFlow
    if (vfCore?.useVueFlow) {
      // Initialize with the ID to connect to the specific instance
      vueFlowComposable = vfCore.useVueFlow({ id: vueFlowId })
      console.log('[FLOW-BUILDER] useVueFlow initialized with id:', vueFlowId, vueFlowComposable)
    } else if (vueFlowInstance.value?.useVueFlow) {
      vueFlowComposable = vueFlowInstance.value.useVueFlow({ id: vueFlowId })
      console.log('[FLOW-BUILDER] useVueFlow initialized from instance:', vueFlowComposable)
    }
  } catch (error) {
    console.error('[FLOW-BUILDER] Failed to initialize Vue Flow:', error)
    return
  }

  // Add keyboard event listener to prevent node deletion
  document.addEventListener('keydown', handleKeyDown, true)

  // Fetch collections used by the flow builder
  try {
    const collectionIds = [
      '2a7ebac6-154a-4af7-8337-411e42e6a35c', // User/Empresa (for empresaId) - MUST BE FIRST
      'a6bcc3c7-09e8-4bd9-9b2d-9ddafce96275', // Message templates (SMS/WhatsApp/Email)
      '32ba8d7c-0932-4ac0-a13b-185374585a92', // Lojas
      'c9c9e7d6-3473-45ef-ac30-3ec128ca3d31', // Segmentos
    ]

    await Promise.all(
      collectionIds.map(id => wwLib.wwCollection.fetchCollection(id))
    )

    console.log('[FLOW-BUILDER] Collections carregadas. empresaId:', empresaId.value)
  } catch (e) {
    console.warn('Failed to fetch collections:', e)
  }

  // Check for flow ID in query string
  const fluxoIdFromUrl = getQueryParam('id')

  if (fluxoIdFromUrl) {
    console.log('[FLOW-BUILDER] ID do fluxo encontrado na URL:', fluxoIdFromUrl)

    // Load existing flow from database
    const loaded = await loadFluxoFromDatabase(fluxoIdFromUrl)

    if (!loaded) {
      // If loading failed, initialize with default nodes
      console.log('[FLOW-BUILDER] Falha ao carregar, inicializando com nodes padrão')
      nodes.value = processInitialNodes()
      edges.value = processInitialEdges()
      updateInternalVariables()
      runValidation()

      // Apply layout after nodes are initialized
      setTimeout(() => {
        if (vueFlowReady.value) {
          console.log('[FLOW-BUILDER] Applying auto layout after fallback init')
          applyAutoLayout(true)
        }
      }, 200)
    }
  } else {
    // No ID in URL, initialize with default nodes (new flow)
    console.log('[FLOW-BUILDER] Novo fluxo - inicializando com nodes padrão')
    nodes.value = processInitialNodes()
    edges.value = processInitialEdges()
    updateInternalVariables()
    runValidation()

    // Apply layout and center view AFTER nodes are initialized
    // Wait for VueFlow to be ready and nodes to be rendered
    setTimeout(() => {
      if (vueFlowReady.value) {
        console.log('[FLOW-BUILDER] Applying auto layout after node initialization')
        applyAutoLayout(true)
      }

      // Auto-select trigger node after layout is applied
      setTimeout(() => {
        const triggerNode = nodes.value.find(n => n.type === 'trigger')
        console.log('[FLOW-BUILDER] Auto-selecting trigger after init:', triggerNode)
        if (triggerNode) {
          currentSelectedNode.value = triggerNode
          setSelectedNodes([triggerNode])
          setSelectedNode(triggerNode)
          console.log('[FLOW-BUILDER] Trigger node selected!')
        }
      }, 400)
    }, 200)
  }
})

onBeforeUnmount(() => {
  // Remove keyboard event listener
  document.removeEventListener('keydown', handleKeyDown, true)
})
</script>

<style scoped>
.flow-builder-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/* Loading State */
.flow-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f9fafb;
}

.flow-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #6b7280;
  font-size: 14px;
}

.flow-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #dc2626;
  font-size: 14px;
  padding: 20px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Header Styles */
.flow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-logo svg {
  width: 24px;
  height: 24px;
}

.header-logo-img {
  height: 28px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
}

.header-flow-name {
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  letter-spacing: -0.01em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.header-flow-name:hover {
  background-color: #f3f4f6;
}

.header-flow-name-input {
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  letter-spacing: -0.01em;
  padding: 4px 8px;
  border: 1px solid #7c3aed;
  border-radius: 4px;
  outline: none;
  background: #ffffff;
  min-width: 150px;
}

.header-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.header-edit-btn:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 19px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn svg {
  flex-shrink: 0;
}

.header-btn-secondary {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.header-btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.header-btn-primary {
  background: #7c3aed;
  color: #ffffff;
  border: none;
}

.header-btn-primary:hover {
  background: #6d28d9;
}

.flow-builder-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
}

.flow-builder-container.read-only {
  pointer-events: none;
  opacity: 0.8;
}

.flow-canvas {
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
  min-height: 0;
}

/* Ensure VueFlow is visible */
:deep(.vue-flow) {
  width: 100%;
  height: 100%;
  min-height: 0;
  background-color: #f3f4f6;
}

/* Vue Flow Customization - Clean Design */
:deep(.vue-flow__edge-path) {
  stroke: #d1d5db;
  stroke-width: 2;
  transition: all 0.2s ease;
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: #9ca3af;
  stroke-width: 2.5;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #7c3aed;
  stroke-width: 2.5;
}

:deep(.vue-flow__connection-line) {
  stroke: #7c3aed;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

:deep(.vue-flow__controls) {
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  bottom: 60px !important;
  left: 20px !important;
}

:deep(.vue-flow__controls-button) {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  width: 28px;
  height: 28px;
  transition: all 0.15s ease;
}

:deep(.vue-flow__controls-button):last-child {
  border-bottom: none;
}

:deep(.vue-flow__controls-button:hover) {
  background: #f9f9f9;
  color: #7c3aed;
}

:deep(.vue-flow__controls-button svg) {
  max-width: 14px;
  max-height: 14px;
}

:deep(.vue-flow__minimap) {
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  bottom: 60px !important;
  right: 20px !important;
}

:deep(.vue-flow__background) {
  background-color: #f3f4f6;
}

/* Add Node Sidebar */
.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 998;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.add-node-sidebar {
  position: absolute;
  left: 0;
  top: 73px;
  bottom: 0;
  width: 280px;
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  letter-spacing: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  line-height: 1;
  transition: all 0.2s ease;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.close-btn:hover {
  color: #374151;
  background: #f9f9f9;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #374151;
  text-align: left;
}

.sidebar-item:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

.sidebar-item:active {
  transform: scale(0.98);
}

.sidebar-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.sidebar-label {
  flex: 1;
  font-weight: 500;
  font-size: 13px;
  color: #374151;
}

.sidebar-handle {
  color: #d1d5db;
  font-size: 16px;
  letter-spacing: -2px;
  flex-shrink: 0;
}

/* Sidebar item specific colors on hover - subtle accents */
.sidebar-item-send_sms:hover .sidebar-icon {
  background: #f0fdf4;
  border-color: #10b981;
}

.sidebar-item-send_whatsapp:hover .sidebar-icon {
  background: #f0fdf4;
  border-color: #10b981;
}

.sidebar-item-send_email:hover .sidebar-icon {
  background: #eff6ff;
  border-color: #3b82f6;
}

.sidebar-item-delay:hover .sidebar-icon {
  background: #faf5ff;
  border-color: #7c3aed;
}

.sidebar-item-condition:hover .sidebar-icon {
  background: #faf5ff;
  border-color: #7c3aed;
}

.sidebar-item-criar_cashback:hover .sidebar-icon {
  background: #fffbeb;
  border-color: #f59e0b;
}

/* Config Panel Right Side */
.config-panel-right {
  position: absolute;
  right: 0;
  top: 73px;
  bottom: 0;
  width: 420px;
  background: white;
  border-left: 1px solid #e5e7eb;
  z-index: 999;
  overflow-y: auto;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

/* Delete Confirmation Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 460px;
  margin: 20px;
  padding: 20px 24px;
}

.modal-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

.modal-message {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.modal-message strong {
  color: #1A1A1A;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.modal-btn-cancel {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.modal-btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.modal-btn-danger {
  background: #b91c1c;
  color: #ffffff;
}

.modal-btn-danger:hover {
  background: #991b1b;
}

.modal-btn-primary {
  background: #7c3aed;
  color: #ffffff;
}

.modal-btn-primary:hover:not(:disabled) {
  background: #6d28d9;
}

.modal-btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button loader spinner */
.btn-loader {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
