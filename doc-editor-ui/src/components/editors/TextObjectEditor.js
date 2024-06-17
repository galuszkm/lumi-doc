import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../context/RefContext";
import EditorFooter from "./EditorFooter"
import ReactQuill from "react-quill"
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import "./TextObjectEditor.css";
import './quill.snow.css';

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
      setText(e);
      setHtml(e);
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
        <div className="lumi-doc-editor-field inline right" style={{ width: useQuill ? "100%" : "auto" }}>
          <label htmlFor="useQuill" className="lumi-doc-editor-field-inputswitch-label left">
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
          <ReactQuill
            theme="snow" 
            value={html} 
            onChange={handleTextChange}
            style={{width: "100%" }}
            placeholder="Insert text ..."
            modules={{
              toolbar: [
                [{size: ['small', 'normal', 'large']}],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                [{'list': 'ordered'}, {'list': 'bullet'}, 
                {'indent': '-1'}, {'indent': '+1'}],
                ['link'],
                ['clean']
              ],
              clipboard: {
                // toggle to add extra line breaks when pasting HTML:
                matchVisual: false,
              }
            }}
            formats={[
              'size',
              'bold', 'italic', 'underline', 'strike',
              'color', 'background',
              'align',
              'list', 'bullet', 'indent',
              'link',
            ]}
          />
        </div>
      )
    } else {
      return (
        <div className="lumi-doc-editor-text-container" style={{marginBottom: 0}}>
          <InputTextarea
            value={text}
            onChange={handleTextChange}
            placeholder="Insert text ..."
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
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default TextObjectEditor;
