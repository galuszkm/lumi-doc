import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../context/RefContext";
import EditorFooter from "./EditorFooter";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import "./ListObjectEditor.css"

const ListObjectEditor = () => {
  // Redux hooks
  const props = useSelector(selectEditorItem);
  const dispatch = useDispatch();

  // Document iframe Ref
  const iframeRef = useRefContext();

  // Local states
  const [title, setTitle] = useState(props.title);
  const [listStyle, setListStyle] = useState(props.listStyle);

  // Handle apply click
  const handleApplyClick = () => {
    dispatch(editNode({key: props.id, props:{title: title, listStyle:listStyle}}));
    dispatch(updateDocItems(iframeRef))
  }

  return (
    <>
      <div className="lumi-doc-editor-container">
        <div className="lumi-doc-editor-field">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            aria-describedby="title-help"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="lumi-doc-editor-field-label-liststyle">List index style</div>
        <div className="lumi-doc-editor-field inline">
          <div className="lumi-doc-editor-field-radiobutton">
            <RadioButton
              name="bullet"
              value="bullet"
              onChange={(e) => setListStyle(e.value)}
              checked={listStyle === "bullet"}
            />
            <label htmlFor="bullet" className="lumi-doc-editor-field-radiobutton-label">
              Bullet
            </label>
          </div>
          <div className="lumi-doc-editor-field-radiobutton">
            <RadioButton
              name="number"
              value="number"
              onChange={(e) => setListStyle(e.value)}
              checked={listStyle === "number"}
            />
            <label htmlFor="number" className="lumi-doc-editor-field-radiobutton-label">
              Number
            </label>
          </div>
          <div className="lumi-doc-editor-field-radiobutton">
            <RadioButton
              name="dash"
              value="dash"
              onChange={(e) => setListStyle(e.value)}
              checked={listStyle === "dash"}
            />
            <label htmlFor="dash" className="lumi-doc-editor-field-radiobutton-label">
              Dash
            </label>
          </div>
        </div>
      </div>
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default ListObjectEditor;
