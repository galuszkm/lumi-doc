import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from 'reselect';
import { scrollToItem, sendItemsToDoc } from "../utils/communicate";
import { getNodeLabel, item2Node } from "../utils/tree";
import { getDefaultProps } from "../utils/default_props";
import { randomID } from "../utils/functions";

const MAX_HISTORY = 50; // Limit the history to 50 states to avoid memory overflow

const initialState = {
  nodes: [],
  expandedKeys: {},
  selectedNodeKeys: {},       // Object to hold selected keys
  colorActive: true,          // Set default to true
  history: [{                 // Stack to store previous states
    nodes: [],
    expandedKeys: {},
    selectedNodeKeys: {},
  }], 
  currentIndex: 0,            // Current index in the history stack
};

const treeSlice = createSlice({
  name: "tree",
  initialState: initialState,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload.map(i => setNodeColorActive(i, state.colorActive));
      addStateToHistory(state);
    },
    setExpandedKeys: (state, action) => {
      state.expandedKeys = action.payload;
    },
    setSelectedNodeKeys: (state, action) => {
      state.selectedNodeKeys = action.payload;
    },
    setColorActive: (state, action) => {
      state.colorActive = action.payload;
      state.nodes = state.nodes.map(i => setNodeColorActive(i, action.payload));
    },
    undo: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        restoreState(state);
      }
    },
    redo: (state) => {
      if (state.currentIndex < state.history.length - 1) {
        state.currentIndex += 1;
        restoreState(state);
      }
    },
    addSectionNode: (state) => {
      const newNode = createNewNode('SectionObject', state.colorActive, randomID(20));
      state.nodes = [...state.nodes, newNode];
      state.selectedNodeKeys = { [newNode.key]: true };
      state.expandedKeys = { ...state.expandedKeys, [newNode.key]: true };
      addStateToHistory(state);
    },
    addItemToNode: (state, action) => {
      const { parentKey, addItemType } = action.payload;
      const newNodeKey = randomID(20);
      const added = addNewNodeToParent(state.nodes, parentKey, newNodeKey, addItemType, state.colorActive);
      if (added) {
        state.selectedNodeKeys = { [newNodeKey]: true };
        state.expandedKeys = { ...state.expandedKeys, [parentKey]: true };
        addStateToHistory(state);
      }
    },
    deleteNodes: (state, action) => {
      const toRemove = action.payload;
      state.nodes = deleteNodesRecursively(state.nodes, toRemove);
      addStateToHistory(state);
    },
    pasteNodes: (state, action) => {
      const { parentKey, nodes, changeKeys } = action.payload;
      const newNodes = filterNodes(nodes, changeKeys);
      const added = addNodesToParent(state.nodes, parentKey, newNodes, state.colorActive);
      if (added) {
        state.selectedNodeKeys = Object.fromEntries(newNodes.map(n => [n.key, true]));
        state.expandedKeys = { ...state.expandedKeys, [parentKey]: true };
        addStateToHistory(state);
      }
    },
    editNode: (state, action) => {
      const { key, props} = action.payload;
      const node = getNodeByKey(state.nodes, key);
      node.props = {...node.props, ...props};
      node.label = getNodeLabel(node.props)
      addStateToHistory(state);
    }
  },
});

export default treeSlice.reducer;

export const { 
  setNodes, setExpandedKeys, setSelectedNodeKeys, setColorActive, 
  undo, redo, addSectionNode, addItemToNode, deleteNodes, pasteNodes,
  editNode,
} = treeSlice.actions;

// ===========================================================
// Selectors

export const selectNodes = state => state.tree.nodes;
export const selectExpandedKeys = state => state.tree.expandedKeys;
export const selectSelectedNodeKeys = state => state.tree.selectedNodeKeys;
export const selectColorActive = state => state.tree.colorActive;
export const selectCurrentIndex = state => state.tree.currentIndex;
export const selectHistoryLength = state => state.tree.history.length;

export const selectSelectedNodes = createSelector(
  [selectNodes, selectSelectedNodeKeys],
  (nodes, selectedNodeKeys) => {
    return Object.keys(selectedNodeKeys).map(k => getNodeByKey(nodes, k));
  }
);
export const selectNodeByKey = createSelector(
  [selectNodes, (state, key) => key],
  (nodes, key) => getNodeByKey(nodes, key)
)

// ===========================================================
// Middlewares and Helper Functions

const addStateToHistory = (state) => {
  const lastState = {
    nodes: state.nodes,
    expandedKeys: state.expandedKeys,
    selectedNodeKeys: state.selectedNodeKeys,
  };
  if (state.history.length >= MAX_HISTORY) {
    state.history.shift(); 
  }
  state.currentIndex++;
  state.history.push(lastState);
};

const setNodeColorActive = (node, flag) => {
  const updatedNode = { ...node, className: node.className || '' };
  if (flag) {
    if (!updatedNode.className.includes(' color_active')) {
      updatedNode.className += ' color_active';
    }
  } else {
    updatedNode.className = updatedNode.className.replace(' color_active', '');
  }
  if (updatedNode.children) {
    updatedNode.children = updatedNode.children.map(j => setNodeColorActive(j, flag));
  }
  return updatedNode;
}

const createNewNode = (type, colorActive, id) => {
  return setNodeColorActive(item2Node({ id: id, ...getDefaultProps(type) }), colorActive);
}

const addNewNodeToParent = (nodes, parentKey, newNodeKey, addItemType, colorActive) => {
  for (let node of nodes) {
    if (node.key === parentKey) {
      const newNode = createNewNode(addItemType, colorActive, newNodeKey);
      node.children = node.children ? [...node.children, newNode] : [newNode];
      return true;
    }
    if (node.children) {
      const found = addNewNodeToParent(node.children, parentKey, newNodeKey, addItemType, colorActive);
      if (found) return true;
    }
  }
  return false;
}

const deleteNodesRecursively = (nodes, toRemove) => {
  return nodes
    .filter(node => !toRemove.includes(node.key))
    .map(node => {
      if (node.children) {
        return { ...node, children: deleteNodesRecursively(node.children, toRemove) };
      }
      return node;
    });
}

const filterNodes = (nodes, changeKeys) => {
  const skipNodes = new Set();
  nodes.forEach(node => {
    nodes.forEach(innerNode => {
      if (node !== innerNode && nodeIncludesKey(innerNode, node.key)) {
        skipNodes.add(node.key);
      }
    });
  });

  return nodes
    .filter(node => !skipNodes.has(node.key))
    .map(node => changeKeys ? deepChangeKey(node) : node);
}

const addNodesToParent = (nodes, parentKey, newNodes, colorActive) => {
  for (let node of nodes) {
    if (node.key === parentKey) {
      node.children = node.children ? [...node.children, ...newNodes] : newNodes;
      node.children.forEach(child => setNodeColorActive(child, colorActive));
      return true;
    }
    if (node.children) {
      const found = addNodesToParent(node.children, parentKey, newNodes, colorActive);
      if (found) return true;
    }
  }
  return false;
}

const getNodeByKey = (nodes, key) => {
  for (let node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = getNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

const extractKeys = (node) => {
  const keys = [node.key];
  if (node.children) {
    keys.push(...node.children.flatMap(c => extractKeys(c)));
  }
  return keys;
}

const nodeIncludesKey = (node, key) => {
  return extractKeys(node).includes(key);
}

const deepChangeKey = (node) => {
  const newKey = randomID(20);
  const newNode = { ...node, key: newKey, props: { ...node.props, id: newKey } };
  if (newNode.children) {
    newNode.children = newNode.children.map(c => deepChangeKey(c));
  }
  return newNode;
}

const restoreState = (state) => {
  const historyState = state.history[state.currentIndex];
  state.nodes = historyState.nodes.map(i => setNodeColorActive(i, state.colorActive));
  state.expandedKeys = historyState.expandedKeys;
  state.selectedNodeKeys = historyState.selectedNodeKeys;
}

// Communication with documnet iframe
export const updateDocItems = (iframeRef) => (dispatch, getState) => {
  const state = getState();
  sendItemsToDoc(iframeRef, state.tree.nodes);
};

export const scrollToSelectedNode = (iframeRef) => (dispatch, getState) => {
  const state = getState();
  const selected = Object.keys(state.tree.selectedNodeKeys);
  if (selected.length > 0) {
    scrollToItem(iframeRef, selected[0]);
  }
};
