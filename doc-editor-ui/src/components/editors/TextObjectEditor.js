import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../context/RefContext";
import Footer from "./Footer"
import { Editor } from 'primereact/editor';
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import "./TextObjectEditor.css"

const TextObjectEditor = () => {
  // Redux hooks
  const props = useSelector(selectEditorItem);
  const dispatch = useDispatch();

  // Document iframe Ref
  const iframeRef = useRefContext();

  // Local states
  const [text, setText] = useState(props.text);
  const [html, setHtml] = useState(props.text);
  const [useQuill, setUseQuill] = useState(props.useQuill !== undefined ? props.useQuill : true);
  const [useHtml, setUseHtml] = useState(props.html !== undefined ? props.html : false);

  // Get Quill html content
  const getHTML = () => {
    return `<div class="ql-editor">${html}</div>`
  }
  // Get pure input text
  const getText = () => {
    return text
  }

  // Handlers
  const handleRichEditorSwitch = (e) => {
    setUseQuill(e.value);
    setUseHtml(e.value);
  }
  const handleTextChange = (e) => {
    if (useQuill){
      setText(e.textValue);
      setHtml(e.htmlValue);
    } else {
      setText(e.target.value);
      setHtml(e.target.value);
    }
  }
  const handleApplyClick = () => {
    dispatch(editNode({
      key: props.id, 
      props:{
        text: useQuill ? getHTML() : getText(), 
        html: useQuill ? true : useHtml,
        useQuill: useQuill,
      }
    }));
    dispatch(updateDocItems(iframeRef))
  }

  // Render Header component
  const renderHeader = () => {
    // If useQuill is false - add extra header features
    const non_rich_header = () => (
      <div style={{flexGrow: 1, marginTop: '5px'}}>
        <Checkbox
          name="useHtml"
          onChange={(e) => setUseHtml(e.checked)}
          checked={useHtml}
        />
        <label htmlFor="useHtml" className="lumi-doc-editor-field-checkbox-label">
          Render as HTML
        </label>
      </div>
    )
    return (
      <div className="lumi-doc-editor-field inline">
        {useQuill ? <></> : non_rich_header()}
        <div
          className="lumi-doc-editor-field inline right"
          style={{ width: useQuill ? "100%" : "auto" }}
        >
          <label
            htmlFor="useQuill"
            className="lumi-doc-editor-field-inputswitch-label left"
          >
            Rich Text Editor
          </label>
          <InputSwitch
            name="useQuill"
            className="lumi-doc-editor-field-inputswitch"
            checked={useQuill}
            onChange={handleRichEditorSwitch}
          />
        </div>
      </div>
    );
  }

  // Render Text Editor component
  const renderContent = () => {
    if (useQuill){
      return (
        <div className="lumi-doc-editor-text-container">
          <Editor
            value={html}
            onTextChange={handleTextChange}
            style={{ height: "20rem", width: "100%" }}
          />
        </div>
      )
    } else {
      return (
        <div className="lumi-doc-editor-text-container" style={{marginBottom: 0}}>
          <InputTextarea
            value={text}
            onChange={handleTextChange}
            style={{ height: "22.65rem", width: "100%", resize: "none", marginBottom: "13px" }}
          />
        </div>
      )
    }
  }

  return (
    <>
      {renderHeader()}
      {renderContent()}
      <Footer onApplyClick={handleApplyClick} />
    </>
  );
};

export default TextObjectEditor;
