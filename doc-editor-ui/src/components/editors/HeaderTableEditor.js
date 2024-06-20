import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectHeader, setHeaderTable, updateDocHeader } from "../../redux/document";
import EditorFooter from "./EditorFooter";
import Spreadsheet from "../spreadsheet/Spreadsheet"
import { useRefContext } from "../../hooks/RefContext";
import "./HeaderTableEditor.css";

const HeaderTableEditor = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const { table } = useSelector(selectHeader);

  // Refs
  const iframeRef = useRefContext();
  const sheetDataRef = useRef([]);

  // Handle apply click
  const handleApplyClick = () => {
    const data = sheetDataRef.current.map((row) =>
      row.map((cell) => {
        const style = { ...cell?.style };
        if (style.display === 'none') {
          delete style.display;
        }
        return {
          value: cell?.value || null,
          style: style,
          ...(cell?.rowSpan > 1 ? { rowSpan: cell.rowSpan } : {}),
          ...(cell?.colSpan > 1 ? { colSpan: cell.colSpan } : {}),
        };
      })
    );
    dispatch(setHeaderTable(data));
    dispatch(updateDocHeader(iframeRef))
  };

  const parseCellProps = (data) => {
    return data.map((row, rowIdx) =>
      row.map((cell, colIdx) => ({
        row: rowIdx,
        column: colIdx,
        ...cell,
      }))
    ).flat()
  }

  return (
    <>
      <div className="lumi-doc-editor-container">
        <Spreadsheet
          data={table}
          cellProps={parseCellProps(table)}
          sheetDataRef={sheetDataRef}
        />
      </div>
      <EditorFooter onApplyClick={handleApplyClick} />
    </>
  );
};

export default HeaderTableEditor;