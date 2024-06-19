import React from "react";
import { useDispatch } from "react-redux";
import { Button } from "primereact/button";
import { setEditorOpen } from "../../redux/editor";
import "./EditorFooter.css"

const EditorFooter = ({ onApplyClick }) => {
  // Redux hooks
  const dispatch = useDispatch();

  return (
    <div className="lumi-doc-editor-footer">
      <Button
        label="Apply"
        icon="pi pi-check"
        aria-label="Apply"
        onClick={onApplyClick}
        style={{marginRight: '15px'}}
      />
      <Button
        label="Cancel"
        severity="danger"
        icon="pi pi-times"
        aria-label="Cancel"
        onClick={() => dispatch(setEditorOpen(false))}
      />
    </div>
  );
};

export default EditorFooter
