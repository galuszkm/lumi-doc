import React, { useState, useEffect } from "react";
import * as ReactSpreadSheet from "./react-spreadsheet";
import SpreadsheetToolbar from "./SpreadsheetToolbar";
import "./Spreadsheet.css";

const parseSheetData = (data, cellProps) => {
  const coveredCells = new Set(); // Track covered cells
  return data.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      // Find this cell props
      const cellProp = Array.isArray(cellProps) ?
        cellProps.find(prop => prop.row === rowIndex && prop.column === colIndex) : 
        null;
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

const Spreadsheet = ({ data, cellProps, sheetDataRef }) => {

  // Local states
  const [sheetData, setSheetData] = useState(() => parseSheetData(data, cellProps));
  const [selectedCells, setSelectedCells] = useState([]);

  // Provide sheetData to parent via ref
  useEffect(() => {
    if (sheetDataRef) {
      sheetDataRef.current = sheetData;
    }
  }, [sheetDataRef, sheetData]);

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

  // Handle update cell props
  const handleUpdateCellProps = (cellProps) => {
    setSheetData(parseSheetData(sheetData, cellProps));
  }

  return (
    <div className="lumi-doc-editor-spreadsheet-box">
      <SpreadsheetToolbar 
        selectedCells={selectedCells} 
        setSelectedCells={setSelectedCells} 
        updateCellProps={handleUpdateCellProps}
        sheetData={sheetData}
        setSheetData={setSheetData}
      />
      <ReactSpreadSheet.Spreadsheet
        className="lumi-doc-editor-spreadsheet data"
        data={sheetData}
        onChange={setSheetData}
        darkMode
        hideRowIndicators
        onSelect={handleOnSelect}
        preventBlur
      />
    </div>
  );
};

export default Spreadsheet;