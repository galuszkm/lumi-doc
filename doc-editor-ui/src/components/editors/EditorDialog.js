import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useDispatch, useSelector } from "react-redux";
import { setEditorOpen, selectEditorOpen, selectEditorItemType, selectEditorItemId } from "../../redux/editor";
import SectionObjectEditor from "./SectionObjectEditor";
import TextObjectEditor from "./TextObjectEditor";
import ListObjectEditor from "./ListObjectEditor";
import { parseItemType } from "../../utils/tree";
import "./EditorDialog.css";

const EditorDialog = () => {
  // Local states
  const [minWidth, setMinWidth] = useState("unset");
  const [minHeight, setMinHeight] = useState("unset");
  const [width, setWidth] = useState("50vw")
  const dialogRef = useRef(null);

  // Redux
  const itemType = useSelector(selectEditorItemType);
  const itemId = useSelector(selectEditorItemId);
  const open = useSelector(selectEditorOpen);
  const dispatch = useDispatch();

  // Set default style on itemType change
  useEffect(() => {
    setMinWidth("unset");
    setMinHeight("unset");
    setWidth("50vw");
  }, [itemType])

  // Handle show dialog event
  const handleOnShow = () => {
    const dialog = dialogRef.current.getElement()
    if (dialog) {
      if (itemType === 'TextObject'){
        setWidth("50vw");
        setMinWidth("10vw");
        setMinHeight(`${dialog.clientHeight}px`);
      } else {
        setMinHeight(`${dialog.clientHeight}px`);
        setMinWidth(`${dialog.clientWidth}px`);
        setWidth("unset");
      }
    };
  }

  const content = () => {
    if (itemType === "SectionObject") {
      return <SectionObjectEditor />;
    } else if (itemType === "TextObject") {
      return <TextObjectEditor />;
    } else if (itemType === "ListObject") {
      return <ListObjectEditor />;
    } else {
      return <div />;
    }
  };

  return (
    <Dialog
      key={itemId}
      visible={open}
      modal={false}
      resizable={true}
      style={{ fontFamily: "Poppins", minWidth: minWidth, minHeight: minHeight, width: width }}
      onHide={() => dispatch(setEditorOpen(false))}
      onShow={handleOnShow}
      header={`Edit ${itemType ? parseItemType(itemType) : ""}`}
      ref={dialogRef}
      className="lumi-doc-editor"
    >
      {content()}
    </Dialog>
  );
};

export default EditorDialog;
