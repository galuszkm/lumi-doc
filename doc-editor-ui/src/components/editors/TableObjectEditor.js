import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectEditorItem } from "../../redux/editor";
import { editNode, updateDocItems } from "../../redux/tree";
import { useRefContext } from "../../context/RefContext";
import EditorFooter from "./EditorFooter";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import Spreadsheet from "../react-spreadsheet";
import ToolbarTableEditor from "./ToolbarTableEditor";
import { filterObjArray } from "../../utils/functions";
import "./TableObjectEditor.css";

const parseSheetData = (data, cellProps) => {
  const coveredCells = new Set(); // Track covered cells
  return data.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      // Find this cell props
      const cellProp = cellProps.find(
        (prop) => prop.row === rowIndex && prop.column === colIndex
      );
      // If this cell has props
      if (cellProp) {
        // Mark cells covered by this cell
        for (let i = 0; i < (cellProp.rowSpan || 1); i++) {
          for (let j = 0; j < (cellProp.colSpan || 1); j++) {
            if (i !== 0 || j !== 0) { // Skip the original cell itself
              coveredCells.add(`${rowIndex + i},${colIndex + j}`);
            }
          }
        }
      }
      // Skip this cell if covered by another cell's rowSpan or colSpan
      if (coveredCells.has(`${rowIndex},${colIndex}`)) {
        return  {
          ...(typeof cell === "object" ? cell : {value: cell}),
          style: {
            display: "none",
            ...(cellProp?.style ? cellProp.style : {}),
          },
        }
      }
      // Remove display from style if it exists
      const { display, ...restStyle } = cellProp?.style || {};
      return {
        ...(typeof cell === "object" ? cell : {value: cell}),
        ...(cellProp ? {
              style: restStyle,
              rowSpan: cellProp.rowSpan,
              colSpan: cellProp.colSpan,
            }: {}),
      };
    })
  )
};

const TableObjectEditor = () => {
  // Redux hooks
  const props = useSelector(selectEditorItem);
  const dispatch = useDispatch();

  // Refs
  const iframeRef = useRefContext();

  // Local states
  const [title, setTitle] = useState(props.title);
  const [sheetData, setSheetData] = useState(() => parseSheetData(props.data, props.cellProps));
  const [showTitle, setShowTitle] = useState(props.showTitle);
  const [selectedCells, setSelectedCells] = useState([]);

  // Handle apply click
  const handleApplyClick = () => {
    const __data__ = sheetData.map(row => row.map(cell => cell.value));
    let __cellProps__ = sheetData.map((row, rowIdx) =>
      row.map(({ value, ...rest }, colIdx) => ({...rest, row: rowIdx, column: colIdx,}))
    );
    // Filter cellProps array of empty elements - skip "row and "column" props
    __cellProps__ = filterObjArray(__cellProps__.flat(), ['row', 'column']);
    // Dispach node edit and update document
    dispatch(editNode({key: props.id, props:{title:title, data:__data__ ?? [], cellProps:__cellProps__ ?? [], showTitle:showTitle}}));
    dispatch(updateDocItems(iframeRef))
  }

  // Handle selection of cells in spreadsheet
  const handleOnSelect = (e) => {
    let range =  e.range ? e.range : [];
    if (e.__proto__.constructor.name === 'EntireColumnsSelection'){
      range = {
        start: { row: 0, column: e.start },
        end: { row: sheetData.length, column: e.end }
      }
    }
    if (
      range?.start?.row !== undefined && 
      range?.start?.column !== undefined && 
      range?.end?.row !== undefined && 
      range?.end?.column!== undefined 
    ) {
    const cells = sheetData.map(
        (row, rowIdx) => 
        row.map((cell, cellIdx) => ({row:rowIdx, column:cellIdx, ...cell}))
      ).flat()
      .filter(i => i.row >= range.start.row && i.column >= range.start.column)
      .filter(i => i.row <= range.end.row && i.column <= range.end.column);
    // Set state
    setSelectedCells(cells);
    }
  }

  const updateCellProps = (cellProps) => {
    setSheetData(parseSheetData(sheetData, cellProps));
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
        <ToolbarTableEditor 
          selectedCells={selectedCells} 
          setSelectedCells={setSelectedCells} 
          updateCellProps={updateCellProps}
          sheetData={sheetData}
          setSheetData={setSheetData}
        />
        <Spreadsheet
          className="lumi-doc-editor-spreadsheet data"
          data={sheetData}
          onChange={setSheetData}
          darkMode
          hideRowIndicators
          onSelect={handleOnSelect}
          preventBlur
        />
      </div>
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default TableObjectEditor;