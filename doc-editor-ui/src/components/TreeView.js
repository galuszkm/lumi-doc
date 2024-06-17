import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  setNodes, setExpandedKeys, setSelectedNodeKeys, setColorActive, undo, redo,
  selectNodes, selectExpandedKeys, selectSelectedNodeKeys, selectColorActive, 
  selectCurrentIndex, selectHistoryLength, selectSelectedNodes, updateDocItems, 
  addItemToNode, addSectionNode, deleteNodes, scrollToSelectedNode, pasteNodes,
} from "../redux/tree";
import { setEditorOpen, setEditorItem, selectEditorItemId } from "../redux/editor";
import EditorWindow from "./editors/EditorDialog";
import { useRefContext } from '../context/RefContext';
import { Tree } from "primereact/tree";
import { ContextMenu } from "primereact/contextmenu";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { drop_allowed, parseItemType } from "../utils/tree";
import { neastingRules, neastableItemTypes, itemIconAndClass } from "../utils/document"
import { scrollToItem } from "../utils/communicate";
import './TreeView.css';

function TreeView() {

  // Local states
  const [contextMenuModel, setContextMenuModel] = useState([]);
  const [nodesClipboard, setNodesClipboard] = useState([]);
  
  // Redux hooks
  const nodes = useSelector(selectNodes);
  const expandedKeys = useSelector(selectExpandedKeys);
  const selectedNodeKeys = useSelector(selectSelectedNodeKeys);
  const selectedNodes = useSelector(selectSelectedNodes)
  const colorActive = useSelector(selectColorActive);
  const currentIndex = useSelector(selectCurrentIndex);
  const historyLength = useSelector(selectHistoryLength);
  const editorItemId = useSelector(selectEditorItemId)
  const dispatch = useDispatch();

  // Refs
  const toast = useRef(null);
  const cm = useRef(null);
  const iframeRef = useRefContext();

  // Confirm dialogs
  const confirmDeleteNodes = (keysToRemove) => {
    // Accept node remove
    const accept = () => {
      // Dispatch delete Nodes and document update
      dispatch(deleteNodes(keysToRemove));
      dispatch(updateDocItems(iframeRef));
      
      // Close Editor if deleted item is edited
      if (keysToRemove.includes(editorItemId)){
        dispatch(setEditorOpen(false));
      }
      // Show message
      toast.current.show({ 
        severity: 'info', 
        summary: 'Items removed', 
        detail: `Removed ${keysToRemove.length} item${keysToRemove.length>1?"s":""} from document`, 
        life: 2000
      });
    }
    // Reject node remove
    const reject = () => {}
    
    // Toogle confirm dialog
    confirmDialog({
      message: `Do you want to delete selected item${keysToRemove.length>1?"s":""}?`,
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept,
      reject,
    });
  };

  // Context menu 
  const getContextMenuModelSingle = (node) => {
    const model = [
      {
        label: "Edit",
        icon: "pi pi-pen-to-square",
        command: () => handleOpenEditor(node),
      },
      {
        label: "Copy",
        icon: "pi pi-copy",
        command: () => handleCopyNodes([node]),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => confirmDeleteNodes([node.key]),
      },
    ];

    // Check if this node is neastable
    if (neastableItemTypes.includes(node.type)){
      // Add paste menu item
      model.splice(2, 0, {
        label: "Paste",
        icon: "pi pi-clipboard",
        command: () => handlePasteNodes(node),
        disabled: nodesClipboard.length === 0,
      })
      // Add submenu with all allowable item types
      model.push({
        label: "Add item",
        icon: "pi pi-plus",
        items: neastingRules[node.type].map(i => {
          return {
            label: parseItemType(i),
            icon: itemIconAndClass[i].icon,
            command: () => handleAddNodeChild(node.key, i),
            expanded: true,
          }
        }),
      });
    }
    return model
  };
  const getContextMenuModelMultiple = (node, selNodes) => {
    const model = [
      {
        label: "Copy",
        icon: "pi pi-copy",
        command: () => handleCopyNodes(selNodes),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => confirmDeleteNodes(selNodes.map(i => i.key)),
      },
    ];
    // Check if this node is neastable
    if (neastableItemTypes.includes(node.type)){
      // Add paste menu item
      model.splice(1, 0, {
        label: "Paste",
        icon: "pi pi-clipboard",
        command: () => handlePasteNodes(node),
        disabled: nodesClipboard.length === 0,
      })
    }
    return model
  };

  // Node template
  const nodeTemplate = (node) => {
    return (
      <div className="custom-node-template">
        <span className="node-label">{node.label}</span>
        <span className="node-type">{node.type.replace('Object', '')}</span>
      </div>
    );
  };

  // ==================================
  // Node folding

  const expandAll = () => {
    let _expandedKeys = {};
    for (let node of nodes) {
      expandNode(node, _expandedKeys);
    }
    dispatch(setExpandedKeys(_expandedKeys));
  };
  const expandNode = (node, _expandedKeys) => {
    if (node.children && node.children.length) {
      _expandedKeys[node.key] = true;
      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };
  const collapseAll = () => dispatch(setExpandedKeys({}));

  // ==================================
  // Drag and Drop handler

  const handleDragDrop = (e) => {
    const draggedNode = e.dragNode;
    const droppedOnNode = e.dropNode;
    const dropIndex = e.dropIndex;

    // Clear tree nodes from class dragover (bug in library)
    clearDragOverClasses()
    
    // Check drop action
    const drop_action = drop_allowed(draggedNode, droppedOnNode);

    // Set updated nodes or show error message
    if (drop_action.status){
      dispatch(setNodes(e.value));
      dispatch(updateDocItems(iframeRef));
      scrollToItem(iframeRef, draggedNode.key);
      dispatch(setExpandedKeys({
        ...expandedKeys,
        ...(droppedOnNode ? { [droppedOnNode.key]: true } : {})
      }));
      dispatch(setSelectedNodeKeys({ [draggedNode.key]: true }));
    } else {
      toast.current.show({
        severity: "error",
        summary: "Action forbidden!",
        detail: drop_action.detail,
        life: 2500,
      });
    }
  };
  const clearDragOverClasses = () => {
    const __nodes__ = document.querySelectorAll('.p-treenode-dragover');
    __nodes__.forEach(node => {
        node.classList.remove('p-treenode-dragover');
    });
  };

  // ==================================
  // Other handlers

  const handleNodeClick = (e) => {
    const { originalEvent, node } = e;

    // Only proceed if the left mouse button is clicked (button === 0)
    if (originalEvent.button !== 0) {
      return;
    }

    let updatedSelectedNodeKeys = { ...selectedNodeKeys };

    if (originalEvent.ctrlKey) {
      if (updatedSelectedNodeKeys[node.key]) {
        delete updatedSelectedNodeKeys[node.key];
      } else {
        updatedSelectedNodeKeys[node.key] = true;
      }
    } else {
      updatedSelectedNodeKeys = { [node.key]: true };
    }
    dispatch(setSelectedNodeKeys(updatedSelectedNodeKeys));
    dispatch(scrollToSelectedNode(iframeRef));
  }
  const handleNodeDoubleClick = (e) => {
    const { originalEvent, node } = e;

    // Only proceed if the left mouse button is clicked (button === 0)
    if (originalEvent.button !== 0) {
      return;
    }
    // Open Editor
    handleOpenEditor(node);
  }
  const handleOnContextMenu = (e) => {
    // Get currently selected node keys
    const selected = Object.keys(selectedNodeKeys);

    // If context menu was toogled on not selected node
    if (!selected.includes(e.node.key)){
      // Select only this node and pass it to create context menu model
      dispatch(setSelectedNodeKeys({[e.node.key]: true}));
      setContextMenuModel(getContextMenuModelSingle(e.node))
    } else {
      // If multiple selection
      if (selected.length > 1){
        // Set context menu model for multiple selection
        setContextMenuModel(getContextMenuModelMultiple(e.node, selectedNodes))
      } else {
        // Set context menu model for single selection
        setContextMenuModel(getContextMenuModelSingle(e.node));
      }
    }
    // Show context menu
    cm.current.show(e.originalEvent);
  }
  const handleAddSection = () => {
    dispatch(addSectionNode());
    dispatch(updateDocItems(iframeRef));
    dispatch(scrollToSelectedNode(iframeRef));
  }
  const handleAddNodeChild = (parentKey, type) => {
    dispatch(addItemToNode({parentKey: parentKey, addItemType:type}));
    dispatch(updateDocItems(iframeRef));
    dispatch(scrollToSelectedNode(iframeRef));
  }
  const handleCopyNodes = (nodes) => {
    // Add nodes to clipboard
    // Using structuredClone in case node deleted before pasting
    setNodesClipboard(state => [...structuredClone(nodes)]);
  }
  const handlePasteNodes = (node) => {
    // If any nodes in clipboard
    if (nodesClipboard.length > 0) {
      // Filter items that are allowed to be pasted (based on types)
      const items_to_paste = nodesClipboard.map(i => {
        if (neastingRules[node.type] && neastingRules[node.type].includes(i.type)) {
          return i
        } else {
          return null
        }
      }).filter(i => i !== null);

      // If something left after filter
      if (items_to_paste.length > 0){
        // Paste nodes to parent and clear clipboard
        dispatch(pasteNodes({parentKey: node.key, nodes: items_to_paste, changeKeys: true }));
        dispatch(updateDocItems(iframeRef));
        dispatch(scrollToSelectedNode(iframeRef));
        setNodesClipboard([]);
      } else {
        // Show error
        toast.current.show({ 
          severity: 'error', 
          summary: 'Could not paste', 
          detail: `Could not paste ${nodesClipboard.length} 
                  item${nodesClipboard.length>1?"s":""} to ${parseItemType(node.type)}`, 
          life: 2000
        });
      }
    }
  }
  const handleOpenEditor = (node) => {
    // Set clicked node to editor and open
    dispatch(setEditorItem(node.props));
    dispatch(setEditorOpen(true));
  }

  // =================================
  // Render

  const toolbar = () => (
    <div 
      className="lumi-doc-editor-content-button-bar" 
      key={"button_bar_content_tab"}
    >
      <div className="lumi-doc-editor-content-button-bar-right">
        <Button
          key={"button_undo"}
          type="button"
          icon="pi pi-arrow-left"
          tooltip="Undo" 
          tooltipOptions={{ showDelay: 500, hideDelay: 50, position: "top", showOnDisabled: true }}
          onClick={() => {
            dispatch(undo());
            dispatch(updateDocItems(iframeRef));
          }}
          disabled={currentIndex <= 0}
        />
        <Button
          key={"button_redo"}
          type="button"
          icon="pi pi-arrow-right"
          tooltip="Redo" 
          tooltipOptions={{ showDelay: 500, hideDelay: 50, position: "top", showOnDisabled: true }}
          onClick={() => {
            dispatch(redo());
            dispatch(updateDocItems(iframeRef));
          }}
          disabled={currentIndex >= historyLength - 1}
        />
      </div>
      <div className="lumi-doc-editor-content-button-bar-left">
        <Button
          key={"button_add_section"}
          type="button"
          icon="pi pi-plus"
          label="Add section"
          onClick={handleAddSection}
        />
      </div>
    </div>
  );
  const treeHeader = (e) => {
    return (
      <div
        className={e.filterContainerClassName}
        style={{ display: "flex", alignItems: "center" }}
      >
        <div className="lumi-doc-editor-content-filter-button-bar-right">
          <Button
            key={"button_expand_all"}
            type="button"
            icon="pi pi-angle-double-down"
            tooltip="Expand all"
            tooltipOptions={{
              showDelay: 800,
              hideDelay: 150,
              position: "top",
            }}
            onClick={expandAll}
          />
          <Button
            key={"button_collapse_all"}
            type="button"
            icon="pi pi-angle-double-up"
            tooltip="Collapse all"
            tooltipOptions={{
              showDelay: 800,
              hideDelay: 150,
              position: "top",
            }}
            onClick={collapseAll}
          />
          <Button
            key={"button_color_nodes"}
            type="button"
            className={
              "lumi-doc-editor-content-button-colorNode" 
              + (colorActive ? '-active' : '-deactive')
            }
            icon="pi pi-palette"
            tooltip="Color nodes"
            tooltipOptions={{
              showDelay: 800,
              hideDelay: 150,
              position: "top",
            }}
            onClick={() => dispatch(setColorActive(!colorActive))}
          />
        </div>
        <IconField className="lumi-doc-editor-content-filter-field" iconPosition="right">
          <InputIcon className={e.filterIconClassName + " pi pi-search"} />
          <InputText
            type="text"
            onChange={e.filterInput.onChange}
            placeholder="Search ..."
            className={e.filterInput.className}
            onKeyDown={e.filterInput.onKeyDown}
            aria-label="Search ..."
          />
        </IconField>
      </div>
    );
  };

  return (
    <>
      <Toast key={"toast_content_tab"} ref={toast} />
      <ContextMenu
        key={"context_menu_content_tab"}
        model={contextMenuModel}
        ref={cm}
      />
      <ConfirmDialog />
      <EditorWindow />
      {toolbar()}
      <Tree
        key={"tree_content_tab"}
        value={nodes}
        nodeTemplate={nodeTemplate}
        expandedKeys={expandedKeys}
        onToggle={(e) => dispatch(setExpandedKeys(e.value))}
        contextMenuSelectionKey={Object.keys(selectedNodeKeys)}
        onNodeClick={(e) => handleNodeClick(e)}
        onNodeDoubleClick={(e) => handleNodeDoubleClick(e)}
        selectionMode="multiple"
        selectionKeys={selectedNodeKeys}
        onContextMenu={(e) => handleOnContextMenu(e)}
        className=""
        style={{ fontSize: "9.5pt", fontFamily: "Poppins", marginTop: "5px" }}
        dragdropScope="demo"
        onDragDrop={handleDragDrop}
        filter
        filterMode="lenient"
        filterPlaceholder="Search ..."
        metaKeySelection={true}
        header={treeHeader}
      />
    </>
  );
};

export default TreeView;
