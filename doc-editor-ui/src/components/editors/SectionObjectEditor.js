import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../context/RefContext";
import Footer from "./Footer";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import "./SectionObjectEditor.css"

const SectionObjectEditor = () => {
  // Redux hooks
  const props = useSelector(selectEditorItem);
  const dispatch = useDispatch();

  // Document iframe Ref
  const iframeRef = useRefContext();

  // Local states
  const [title, setTitle] = useState(props.title);
  const [index, setIndex] = useState(props.index);
  const [underline, setUnderLine] = useState(props.underline);

  // Handle apply click
  const handleApplyClick = () => {
    dispatch(editNode({key: props.id, props:{title: title, index:index, underline:underline}}));
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
            <label htmlFor="index">Index</label>
            <InputText
              id="index"
              aria-describedby="index-help"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
            />
          </div>
          <div className="lumi-doc-editor-field inline section-underline">
            <Checkbox
              inputId="underline"
              name="underline"
              value="underline"
              onChange={(e) => setUnderLine(e.checked)}
              checked={underline}
            />
            <label htmlFor="underline">
              Underline
            </label>
          </div>
        </div>
      </div>
      <Footer onApplyClick={handleApplyClick} />
    </>
  );
};

export default SectionObjectEditor;
