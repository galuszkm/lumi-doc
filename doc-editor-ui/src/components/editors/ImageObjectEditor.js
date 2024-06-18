import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { selectSessionResources } from "../../redux/session";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../hooks/RefContext";
import EditorFooter from "./EditorFooter";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from 'primereact/dropdown';
import "./ImageObjectEditor.css"

const ImageObjectEditor = () => {
  // Redux hooks
  const props = useSelector(selectEditorItem);
  const dispatch = useDispatch();
  const sessionResources = useSelector(selectSessionResources);

  // Document iframe Ref
  const iframeRef = useRefContext();

  // Local states
  const [title, setTitle] = useState(props.title);
  const [url, setUrl] = useState(props.url);
  const [useWebUrl, setUseWebUrl] = useState(props.url.startsWith('http'));
  const [width, setWidth] = useState(props.width);
  const [showTitle, setShowTitle] = useState(props.showTitle);
  const [maxHeight, setMaxHeight] = useState(props.maxHeight);
  const fileOptions = sessionResources.filter(i => i.type === "image").map(i => ({ name: i.filename, value: i.docUrl }));

  // Handle apply click
  const handleApplyClick = () => {
    dispatch(editNode({key: props.id, props:{title:title, url:url, width:width, showTitle:showTitle, maxHeight:maxHeight}}));
    dispatch(updateDocItems(iframeRef))
  }

  const handleuseWebUrlChange = (e) => {
    setUseWebUrl(e.value)
  }

  const renderUrlField = () => {
    if (useWebUrl){
      return (
        <>
          <label htmlFor="index">Image URL</label>
          <InputText
            id="url"
            className="image-url-field"
            aria-describedby="title-url"
            value={url}
            placeholder="https://image.jpeg"
            onChange={(e) => setUrl(e.target.value)}
          />
      </>
      )
    } else {
      return (
        <>
          <label htmlFor="index">Resource filename</label>
          <Dropdown
            className="lumi-doc-editor-field-dropdown image-url-field"
            value={url} 
            onChange={(e) => setUrl(e.value)} 
            options={fileOptions}
            optionLabel="name"
            placeholder="Select image file" 
          />
        </>
      )
    }
  }

  return (
    <>
      <div className="lumi-doc-editor-container">
        <div className="lumi-doc-editor-field inline">
          <div className="lumi-doc-editor-field">
            <label htmlFor="title">Title</label>
            <InputText
              id="title"
              className="image-title"
              aria-describedby="title-help"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="lumi-doc-editor-field inline image-showTitle">
            <Checkbox
              inputId="showTitle"
              name="showTitle"
              value="showTitle"
              onChange={(e) => setShowTitle(e.checked)}
              checked={showTitle}
            />
            <label htmlFor="showTitle">
              Show title
            </label>
          </div>
        </div>
        <div className="lumi-doc-editor-field inline">
          <div className="lumi-doc-editor-field">
            {renderUrlField()}
          </div>
          <div className="lumi-doc-editor-field inline image-useWebUrl" style={{ marginLeft: "20px" }}>
            <InputSwitch
              name="useWebUrl"
              className="lumi-doc-editor-field-inputswitch"
              checked={useWebUrl}
              onChange={handleuseWebUrlChange}
            />
            <label htmlFor="useWebUrl" className="lumi-doc-editor-field-inputswitch-label left">
              Link to website
            </label>
          </div>
        </div>
        <div className="lumi-doc-editor-field inline">
          <div className="lumi-doc-editor-field">
            <label htmlFor="index">Width [%]</label>
            <InputNumber
              id="width"
              aria-describedby="width-help"
              value={width}
              onChange={(e) => setWidth(e.value)}
              max={100}
              min={0}
            />
          </div>
          <div className="lumi-doc-editor-field" style={{marginLeft: "20px"}}>
            <label htmlFor="index">Max height [px]</label>
            <InputNumber
              id="maxHeight"
              aria-describedby="maxHeight-help"
              value={maxHeight}
              onChange={(e) => setMaxHeight(e.value)}
              min={0}
              max={1000}
            />
          </div>
        </div>
      </div>
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default ImageObjectEditor;
