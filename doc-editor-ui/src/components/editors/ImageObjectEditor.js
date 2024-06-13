import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { selectSessionResources } from "../../redux/session";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../context/RefContext";
import EditorFooter from "./EditorFooter";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
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
  const [width, setWidth] = useState(props.width);
  const [showTitle, setShowTitle] = useState(props.showTitle);
  const [maxHeight, setMaxHeight] = useState(props.maxHeight);
  const fileOptions = sessionResources.filter(i => i.type === "image").map(i => ({ name: i.filename, value: i.docUrl }));

  // Handle apply click
  const handleApplyClick = () => {
    dispatch(editNode({key: props.id, props:{title:title, url:url, width:width, showTitle:showTitle, maxHeight:maxHeight}}));
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
        <div className="lumi-doc-editor-field inline">
          <div className="lumi-doc-editor-field">
            <label htmlFor="index">Resource filename</label>
            <Dropdown
              className="lumi-doc-editor-field-dropdown"
              value={url} 
              onChange={(e) => setUrl(e.value)} 
              options={fileOptions}
              optionLabel="name"
              placeholder="Select image file" 
            />
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
      </div>
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default ImageObjectEditor;
