import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { selectEditorItem } from "../../redux/editor";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../hooks/RefContext";
import EditorFooter from "./EditorFooter";
import Spreadsheet from "../spreadsheet/Spreadsheet"
import { filterObjArray } from "../../utils/functions";
import "./TableObjectEditor.css";

const TableObjectEditor = () => {
  // Redux hooks
  const props = useSelector(selectEditorItem);
  const dispatch = useDispatch();

  // Refs
  const iframeRef = useRefContext();
  const sheetDataRef = useRef([]);

  // Local states
  const [title, setTitle] = useState(props.title);
  const [showTitle, setShowTitle] = useState(props.showTitle);

  // Handle apply click
  const handleApplyClick = () => {
    const __data__ = sheetDataRef.current.map(row => row.map(cell => cell?.value || null));
    let __cellProps__ = sheetDataRef.current.map((row, rowIdx) =>
      row.map((cell, colIdx) => {
        if (!cell) {
          return { row: rowIdx, column: colIdx };
        }
        const { value, ...rest } = cell;
        return { ...rest, row: rowIdx, column: colIdx };
      })
    );
    // Filter cellProps array of empty elements - skip "row and "column" props
    __cellProps__ = filterObjArray(__cellProps__.flat(), ['row', 'column']);
    // Dispach node edit and update document
    dispatch(editNode({key: props.id, props:{title:title, data:__data__ ?? [], cellProps:__cellProps__ ?? [], showTitle:showTitle}}));
    dispatch(updateDocItems(iframeRef))
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
        <Spreadsheet
          data={props.data}
          cellProps={props.cellProps}
          sheetDataRef={sheetDataRef}
        />
      </div>
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default TableObjectEditor;