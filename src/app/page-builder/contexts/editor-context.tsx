'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

import {
  PageConfig,
  ComponentInstance,
  createComponentInstance,
} from '../interfaces/page-config.interface';
import { getComponent } from '../registry/component-registry';

/**
 * Validation Error
 */
export interface ValidationError {
  componentId: string;
  field: string;
  message: string;
}

/**
 * Context Menu State
 */
interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  componentId: string | null;
}

/**
 * Clipboard State
 */
interface ClipboardState {
  component: ComponentInstance | null;
  isCut: boolean;
}

/**
 * Editor State
 */
interface EditorState {
  page: PageConfig | null;
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  renamingComponentId: string | null;
  sidebarTab: 'components' | 'layers';
  contextMenu: ContextMenuState;
  clipboard: ClipboardState;
  isDragging: boolean;
  draggedComponentType: string | null;
  history: PageConfig[];
  historyIndex: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  previewMode: boolean;
  validationErrors: ValidationError[];
}

/**
 * Editor Actions
 */
type EditorAction =
  | { type: 'SET_PAGE'; payload: PageConfig }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'HOVER_COMPONENT'; payload: string | null }
  | { type: 'START_RENAME'; payload: string }
  | { type: 'STOP_RENAME' }
  | { type: 'SET_SIDEBAR_TAB'; payload: 'components' | 'layers' }
  | { type: 'OPEN_CONTEXT_MENU'; payload: { x: number; y: number; componentId: string } }
  | { type: 'CLOSE_CONTEXT_MENU' }
  | { type: 'START_DRAG'; payload: string }
  | { type: 'END_DRAG' }
  | { type: 'ADD_COMPONENT'; payload: { parentId: string | null; componentType: string; index: number } }
  | { type: 'REMOVE_COMPONENT'; payload: string }
  | { type: 'RENAME_COMPONENT'; payload: { id: string; name: string } }
  | { type: 'UPDATE_COMPONENT_PROPS'; payload: { id: string; props: Record<string, unknown> } }
  | { type: 'MOVE_COMPONENT'; payload: { id: string; newParentId: string | null; newIndex: number } }
  | { type: 'COPY_COMPONENT'; payload: string }
  | { type: 'CUT_COMPONENT'; payload: string }
  | { type: 'PASTE_COMPONENT'; payload: { parentId: string | null; index: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'MARK_SAVED' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] };

/**
 * Initial state
 */
const initialState: EditorState = {
  page: null,
  selectedComponentId: null,
  hoveredComponentId: null,
  renamingComponentId: null,
  sidebarTab: 'components',
  contextMenu: { isOpen: false, x: 0, y: 0, componentId: null },
  clipboard: { component: null, isCut: false },
  isDragging: false,
  draggedComponentType: null,
  history: [],
  historyIndex: -1,
  isSaving: false,
  hasUnsavedChanges: false,
  previewMode: false,
  validationErrors: [],
};

/**
 * Find a component by ID in a component tree
 */
function findComponentById(
  components: ComponentInstance[],
  id: string
): ComponentInstance | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentById(comp.children, id);

      if (found) return found;
    }
  }

  return null;
}

/**
 * Find the parent ID and index of a component
 * Returns { parentId: null, index } for root-level components
 */
function findComponentParentAndIndex(
  components: ComponentInstance[],
  id: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (comp.id === id) {
      return { parentId, index: i };
    }
    if (comp.children) {
      const found = findComponentParentAndIndex(comp.children, id, comp.id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Remove a component from the tree
 */
function removeComponentFromTree(
  components: ComponentInstance[],
  id: string
): ComponentInstance[] {
  return components
    .filter((c) => c.id !== id)
    .map((c) => ({
      ...c,
      children: c.children ? removeComponentFromTree(c.children, id) : undefined,
    }));
}

/**
 * Add a component to the tree
 */
function addComponentToTree(
  components: ComponentInstance[],
  parentId: string | null,
  newComponent: ComponentInstance,
  index: number
): ComponentInstance[] {
  if (parentId === null) {
    // Add to root level
    const newComponents = [...components];

    newComponents.splice(index, 0, newComponent);

    // Update order values
    return newComponents.map((c, i) => ({ ...c, order: i }));
  }

  // Add to a parent component
  return components.map((c) => {
    if (c.id === parentId) {
      const children = c.children || [];
      const newChildren = [...children];

      newChildren.splice(index, 0, newComponent);

      return {
        ...c,
        children: newChildren.map((child, i) => ({ ...child, order: i })),
      };
    }

    if (c.children) {
      return {
        ...c,
        children: addComponentToTree(c.children, parentId, newComponent, index),
      };
    }

    return c;
  });
}

/**
 * Check if potentialDescendantId is a descendant of ancestorId
 * Used to prevent dropping a container into itself or its descendants
 */
function isDescendantOf(
  components: ComponentInstance[],
  potentialDescendantId: string | null,
  ancestorId: string
): boolean {
  if (!potentialDescendantId) return false;
  if (potentialDescendantId === ancestorId) return true;

  const ancestor = findComponentById(components, ancestorId);
  if (!ancestor?.children) return false;

  for (const child of ancestor.children) {
    if (child.id === potentialDescendantId) return true;
    if (child.children && isDescendantOf([child], potentialDescendantId, child.id)) {
      return true;
    }
  }

  return false;
}

/**
 * Update component props in the tree
 */
function updateComponentPropsInTree(
  components: ComponentInstance[],
  id: string,
  props: Record<string, unknown>
): ComponentInstance[] {
  return components.map((c) => {
    if (c.id === id) {
      return { ...c, props: { ...c.props, ...props } };
    }

    if (c.children) {
      return {
        ...c,
        children: updateComponentPropsInTree(c.children, id, props),
      };
    }

    return c;
  });
}

/**
 * Rename a component in the tree
 */
function renameComponentInTree(
  components: ComponentInstance[],
  id: string,
  name: string
): ComponentInstance[] {
  return components.map((c) => {
    if (c.id === id) {
      return { ...c, name };
    }

    if (c.children) {
      return {
        ...c,
        children: renameComponentInTree(c.children, id, name),
      };
    }

    return c;
  });
}

/**
 * Deep clone a component with new IDs
 */
function cloneComponentWithNewIds(component: ComponentInstance): ComponentInstance {
  const newId = crypto.randomUUID();
  return {
    ...component,
    id: newId,
    children: component.children?.map(child => cloneComponentWithNewIds(child)),
  };
}

/**
 * Push to history helper
 */
function pushHistory(state: EditorState, newPage: PageConfig): EditorState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);

  newHistory.push(newPage);

  // Limit history to 50 entries
  if (newHistory.length > 50) {
    newHistory.shift();
  }

  return {
    ...state,
    page: newPage,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    hasUnsavedChanges: true,
  };
}

/**
 * Editor Reducer
 */
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
  case 'SET_PAGE':
    return {
      ...state,
      page: action.payload,
      history: [action.payload],
      historyIndex: 0,
      hasUnsavedChanges: false,
      selectedComponentId: null,
    };

  case 'SELECT_COMPONENT':
    return { ...state, selectedComponentId: action.payload };

  case 'HOVER_COMPONENT':
    return { ...state, hoveredComponentId: action.payload };

  case 'START_RENAME':
    return { ...state, renamingComponentId: action.payload };

  case 'STOP_RENAME':
    return { ...state, renamingComponentId: null };

  case 'SET_SIDEBAR_TAB':
    return { ...state, sidebarTab: action.payload };

  case 'OPEN_CONTEXT_MENU':
    return {
      ...state,
      contextMenu: {
        isOpen: true,
        x: action.payload.x,
        y: action.payload.y,
        componentId: action.payload.componentId,
      },
      selectedComponentId: action.payload.componentId,
    };

  case 'CLOSE_CONTEXT_MENU':
    return {
      ...state,
      contextMenu: { isOpen: false, x: 0, y: 0, componentId: null },
    };

  case 'START_DRAG':
    return { ...state, isDragging: true, draggedComponentType: action.payload };

  case 'END_DRAG':
    return { ...state, isDragging: false, draggedComponentType: null };

  case 'ADD_COMPONENT': {
    if (!state.page) return state;

    const registryEntry = getComponent(action.payload.componentType);

    if (!registryEntry) return state;

    const newComponent = createComponentInstance(
      action.payload.componentType,
      { ...registryEntry.defaultProps },
      action.payload.index
    );

    if (registryEntry.acceptsChildren) {
      newComponent.children = [];
    }

    const newComponents = addComponentToTree(
      state.page.components,
      action.payload.parentId,
      newComponent,
      action.payload.index
    );

    const newPage = { ...state.page, components: newComponents };

    return {
      ...pushHistory(state, newPage),
      selectedComponentId: newComponent.id,
    };
  }

  case 'REMOVE_COMPONENT': {
    if (!state.page) return state;

    const newComponents = removeComponentFromTree(
      state.page.components,
      action.payload
    );

    const newPage = { ...state.page, components: newComponents };

    return {
      ...pushHistory(state, newPage),
      selectedComponentId: state.selectedComponentId === action.payload ? null : state.selectedComponentId,
    };
  }

  case 'RENAME_COMPONENT': {
    if (!state.page) return state;

    const newComponents = renameComponentInTree(
      state.page.components,
      action.payload.id,
      action.payload.name
    );

    const newPage = { ...state.page, components: newComponents };

    return pushHistory(state, newPage);
  }

  case 'UPDATE_COMPONENT_PROPS': {
    if (!state.page) return state;

    const newComponents = updateComponentPropsInTree(
      state.page.components,
      action.payload.id,
      action.payload.props
    );

    const newPage = { ...state.page, components: newComponents };

    return pushHistory(state, newPage);
  }

  case 'MOVE_COMPONENT': {
    if (!state.page) return state;

    const { id, newParentId, newIndex } = action.payload;

    // Find the component to move
    const componentToMove = findComponentById(state.page.components, id);
    if (!componentToMove) return state;

    // Prevent dropping a container into itself or its descendants
    if (newParentId && isDescendantOf(state.page.components, newParentId, id)) {
      return state;
    }

    // Also prevent dropping into itself
    if (id === newParentId) {
      return state;
    }

    // Remove from current location
    let newComponents = removeComponentFromTree(state.page.components, id);

    // Create a clean copy without children reference issues
    const componentCopy: ComponentInstance = {
      ...componentToMove,
      children: componentToMove.children ? [...componentToMove.children] : undefined,
    };

    // Add to new location
    newComponents = addComponentToTree(newComponents, newParentId, componentCopy, newIndex);

    const newPage = { ...state.page, components: newComponents };

    return pushHistory(state, newPage);
  }

  case 'COPY_COMPONENT': {
    if (!state.page) return state;

    const componentToCopy = findComponentById(state.page.components, action.payload);
    if (!componentToCopy) return state;

    // Deep clone the component for clipboard
    const clonedComponent = JSON.parse(JSON.stringify(componentToCopy));

    return {
      ...state,
      clipboard: { component: clonedComponent, isCut: false },
    };
  }

  case 'CUT_COMPONENT': {
    if (!state.page) return state;

    const componentToCut = findComponentById(state.page.components, action.payload);
    if (!componentToCut) return state;

    // Deep clone the component for clipboard
    const clonedComponent = JSON.parse(JSON.stringify(componentToCut));

    return {
      ...state,
      clipboard: { component: clonedComponent, isCut: true },
    };
  }

  case 'PASTE_COMPONENT': {
    if (!state.page || !state.clipboard.component) return state;

    const { parentId, index } = action.payload;

    // Clone the component with new IDs
    const pastedComponent = cloneComponentWithNewIds(state.clipboard.component);
    pastedComponent.order = index;

    // Add to tree
    let newComponents = addComponentToTree(
      state.page.components,
      parentId,
      pastedComponent,
      index
    );

    // If it was a cut operation, remove the original
    if (state.clipboard.isCut) {
      newComponents = removeComponentFromTree(newComponents, state.clipboard.component.id);
    }

    const newPage = { ...state.page, components: newComponents };

    return {
      ...pushHistory(state, newPage),
      clipboard: state.clipboard.isCut ? { component: null, isCut: false } : state.clipboard,
      selectedComponentId: pastedComponent.id,
    };
  }

  case 'UNDO': {
    if (state.historyIndex <= 0) return state;

    return {
      ...state,
      historyIndex: state.historyIndex - 1,
      page: state.history[state.historyIndex - 1],
      hasUnsavedChanges: true,
    };
  }

  case 'REDO': {
    if (state.historyIndex >= state.history.length - 1) return state;

    return {
      ...state,
      historyIndex: state.historyIndex + 1,
      page: state.history[state.historyIndex + 1],
      hasUnsavedChanges: true,
    };
  }

  case 'SET_SAVING':
    return { ...state, isSaving: action.payload };

  case 'MARK_SAVED':
    return { ...state, hasUnsavedChanges: false, isSaving: false };

  case 'TOGGLE_PREVIEW':
    return { ...state, previewMode: !state.previewMode };

  case 'SET_VALIDATION_ERRORS':
    return { ...state, validationErrors: action.payload };

  default:
    return state;
  }
}

/**
 * Context
 */
interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Convenience methods
  selectComponent: (_id: string | null) => void;
  addComponent: (_componentType: string, _parentId?: string | null, _index?: number) => void;
  removeComponent: (_id: string) => void;
  renameComponent: (_id: string, _name: string) => void;
  startRename: (_id: string) => void;
  stopRename: () => void;
  setSidebarTab: (_tab: 'components' | 'layers') => void;
  openContextMenu: (_x: number, _y: number, _componentId: string) => void;
  closeContextMenu: () => void;
  updateComponentProps: (_id: string, _props: Record<string, unknown>) => void;
  moveComponent: (_id: string, _newParentId: string | null, _newIndex: number) => void;
  copyComponent: (_id: string) => void;
  cutComponent: (_id: string) => void;
  pasteComponent: (_parentId: string | null, _index: number) => void;
  getComponentParentInfo: (_id: string) => { parentId: string | null; index: number } | null;
  setValidationErrors: (_errors: ValidationError[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canPaste: boolean;
  hasValidationErrors: boolean;
  selectedComponent: ComponentInstance | null;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

/**
 * Editor Provider
 */
export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const selectComponent = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_COMPONENT', payload: id });
  }, []);

  const addComponent = useCallback((
    componentType: string,
    parentId: string | null = null,
    index: number = 0
  ) => {
    dispatch({ type: 'ADD_COMPONENT', payload: { componentType, parentId, index } });
  }, []);

  const removeComponent = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_COMPONENT', payload: id });
  }, []);

  const renameComponent = useCallback((id: string, name: string) => {
    dispatch({ type: 'RENAME_COMPONENT', payload: { id, name } });
  }, []);

  const startRename = useCallback((id: string) => {
    dispatch({ type: 'START_RENAME', payload: id });
  }, []);

  const stopRename = useCallback(() => {
    dispatch({ type: 'STOP_RENAME' });
  }, []);

  const setSidebarTab = useCallback((tab: 'components' | 'layers') => {
    dispatch({ type: 'SET_SIDEBAR_TAB', payload: tab });
  }, []);

  const openContextMenu = useCallback((x: number, y: number, componentId: string) => {
    dispatch({ type: 'OPEN_CONTEXT_MENU', payload: { x, y, componentId } });
  }, []);

  const closeContextMenu = useCallback(() => {
    dispatch({ type: 'CLOSE_CONTEXT_MENU' });
  }, []);

  const updateComponentProps = useCallback((id: string, props: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', payload: { id, props } });
  }, []);

  const moveComponent = useCallback((id: string, newParentId: string | null, newIndex: number) => {
    dispatch({ type: 'MOVE_COMPONENT', payload: { id, newParentId, newIndex } });
  }, []);

  const copyComponent = useCallback((id: string) => {
    dispatch({ type: 'COPY_COMPONENT', payload: id });
  }, []);

  const cutComponent = useCallback((id: string) => {
    dispatch({ type: 'CUT_COMPONENT', payload: id });
  }, []);

  const pasteComponent = useCallback((parentId: string | null, index: number) => {
    dispatch({ type: 'PASTE_COMPONENT', payload: { parentId, index } });
  }, []);

  const getComponentParentInfo = useCallback((id: string) => {
    if (!state.page) return null;
    return findComponentParentAndIndex(state.page.components, id);
  }, [state.page]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const setValidationErrors = useCallback((errors: ValidationError[]) => {
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;
  const canPaste = state.clipboard.component !== null;
  const hasValidationErrors = state.validationErrors.length > 0;

  const selectedComponent = state.selectedComponentId && state.page
    ? findComponentById(state.page.components, state.selectedComponentId)
    : null;

  const value: EditorContextValue = {
    state,
    dispatch,
    selectComponent,
    addComponent,
    removeComponent,
    renameComponent,
    startRename,
    stopRename,
    setSidebarTab,
    openContextMenu,
    closeContextMenu,
    updateComponentProps,
    moveComponent,
    copyComponent,
    cutComponent,
    pasteComponent,
    getComponentParentInfo,
    setValidationErrors,
    undo,
    redo,
    canUndo,
    canRedo,
    canPaste,
    hasValidationErrors,
    selectedComponent,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

/**
 * Hook to use editor context
 */
export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }

  return context;
}

export default EditorContext;
