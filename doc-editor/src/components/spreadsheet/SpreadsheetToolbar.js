import React, { useState, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { ColorPicker, themes } from 'react-pick-color';
import icons from '../../icons/icons_quill';
import './SpreadsheetToolbar.css';

const predefinedColors = [
  '#000000', '#e60000', '#ff9900', '#ffff00', 
  '#008a00', '#0066cc', '#9933ff', '#ffffff'
];
const tooltipOptions = { showDelay: 500, position: 'top' };

const SpreadsheetToolbar = ({ selectedCells, setSelectedCells, updateCellProps, sheetData, setSheetData }) => {
  const [colorType, setColorType] = useState(null);
  const textColorRef = useRef(null);
  const backgroundColorRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const setModifiedCells = (newCells) => {
    setSelectedCells(newCells);
    updateCellProps(newCells);
  }

  const getCellStyle = () => {
    const combinedStyle = selectedCells
      .map(i => i.style ?? {})
      .reduce((acc, style) => ({ ...acc, ...style }), {});
    const defaultStyle = {
      color: 'white',
      backgroundColor: 'white'
    };
    return { ...defaultStyle, ...combinedStyle };
  };

  const handleChangeFormat = (key) => {
    const format_map = {
      bold: { fontWeight: "bold" },
      italic: { fontStyle: "italic" },
      strike: { textDecoration: "line-through" }
    };
    const newCells = selectedCells.map(i => ({ ...i, style: { ...i.style, ...format_map[key] } }));
    setModifiedCells(newCells);
  };

  const handleChangeColor = (color) => {
    const colorHex = color.hex;
    const updateProps = () => {
      if (colorType === 'text') {
        const newCells = selectedCells.map(i => ({ ...i, style: { ...i.style, color: colorHex } }));
        setModifiedCells(newCells);
      } else if (colorType === 'background') {
        const newCells = selectedCells.map(i => ({ ...i, style: { ...i.style, backgroundColor: colorHex } }));
        setModifiedCells(newCells);
      }
    };
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(updateProps, 500);
  };

  const handleTextAlign = (alignment) => {
    const newCells = selectedCells.map(i => ({ ...i, style: { ...i.style, textAlign: alignment } }));
    setModifiedCells(newCells);
  };

  const handleClearFormatting = () => {
    const newCells = selectedCells.map(i => ({ ...i, style: {} }));
    setModifiedCells(newCells);
  };

  const findUpperLeftCell = () => {
    return selectedCells.reduce((upperLeft, current) => {
      if (
        current.row < upperLeft.row ||
        (current.row === upperLeft.row && current.column < upperLeft.column)
      ) {
        return current;
      }
      return upperLeft;
    }, selectedCells[0]);
  }

  const getMaxPosition = (max, current) => {
    const currentMaxRow = typeof current.rowSpan === "number" 
      ? current.row + current.rowSpan - 1 
      : current.row;
    const currentMaxColumn = typeof current.colSpan === "number" 
      ? current.column + current.colSpan - 1 
      : current.column;
    return {
      maxRow: Math.max(max.maxRow, currentMaxRow),
      maxColumn: Math.max(max.maxColumn, currentMaxColumn),
    };
  };

  const selectionSpan = () => {
    // Find top-left most selected cell
    const upperLeftCell = findUpperLeftCell();

    // Find bottom-right most selected cell
    const initialMax = {
      maxRow: upperLeftCell.row,
      maxColumn: upperLeftCell.column,
    };
    const { maxRow, maxColumn } = selectedCells.reduce(getMaxPosition, initialMax);

    return {
      rowSpan: maxRow - upperLeftCell.row,
      colSpan: maxColumn - upperLeftCell.column,
    }
  }

  const selectionRange = () => {
    // Find top-left most selected cell
    const upperLeftCell = findUpperLeftCell();
    // Selection span
    const {rowSpan, colSpan} = selectionSpan()
    return {
      row: { 
        start: upperLeftCell.row, 
        end: upperLeftCell.row + rowSpan 
      },
      column: {
        start: upperLeftCell.column,
        end: upperLeftCell.column + colSpan,
      },
    };
  }

  const findCellsInRange = (rowStart, rowEnd, colStart, colEnd) => {
    // Find all cells in range
    // Use full sheet data (not only selected cells)
    return sheetData.map((row, rowIdx) => row.map((cell, colIdx) => {
      if (rowIdx >= rowStart && rowIdx <= rowEnd && colIdx>=colStart && colIdx<=colEnd){
        const {value: _, ...__props__} = cell
        return { row:rowIdx, column:colIdx, ...__props__}
      } else {
        return null;
      }
    })).flat().filter(i => i !== null)
  }

  const handleMergeCells = () => {
    if (selectedCells.length > 0) {
      // Find top-left most selected cell
      const upperLeftCell = findUpperLeftCell();
      // Find selection range
      const { rowSpan, colSpan } = selectionSpan();
      // Set row and column spans to selected cells
      // Set top-left cell spans to cover the rest of the cells
      // Set the rest of the cells spans to 0
      const newCells = [
        {...upperLeftCell, rowSpan: rowSpan+1, colSpan: colSpan+1},
        ...selectedCells.filter(i => i !== upperLeftCell).map(i => ({...i, rowSpan:0, colSpan:0}))
      ]
      setModifiedCells(newCells);
    } else {
      console.warn("Table Object Editor: Cannot merge table cells - no cell selected");
    }
  }

  const handleUnmergeCells = () => {
    if (selectedCells.length > 0) {
      // Find selection range
      const range = selectionRange()
      // Find all cells in selection range
      // If selected cell was marge before - the covered cells are not in selection
      // findCellsInRange uses full sheet data to find the cells in range
      const cellsInRange = findCellsInRange(
        range.row.start, range.row.end, range.column.start, range.column.end
      );
      // Set row and column spans to all cells in range
      const newCells = cellsInRange.map(i => { return {...i, rowSpan:1, colSpan:1} });
      setModifiedCells(newCells);
    } else {
      console.warn("Table Object Editor: Cannot unmerge table cells - no cell selected");
    }
  }

  const handleInsertRow = () => {
    alert('Insert row not implemented yet!')
  }

  const handleInsertColumn = () => {
    alert('Insert column not implemented yet!')
  }

  const handleRemoveRows = () => {
    if (selectedCells.length > 0) {
      // Selection range
      const range = selectionRange();
      // Filter sheet data
      const newData = sheetData.filter((i, idx) => idx < range.row.start || idx > range.row.end);
      // Set new sheet data
      setSheetData(newData);
    } else {
      console.warn("Table Object Editor: Cannot remove table rows - no cell selected");
    }
  }

  const handleRemoveColumns = () => {
    if (selectedCells.length > 0) {
      // Selection range
      const range = selectionRange();
      // Filter sheet data
      const newData = sheetData.map(row => row.filter((i, idx) => idx < range.column.start || idx > range.column.end));
      // Set new sheet data
      setSheetData(newData);

    } else {
      console.warn("Table Object Editor: Cannot remove table columns - no cell selected");
    }
  }

  return (
    <div>
      <div className="lumi-doc-editor spreadsheet-toolbar">
        <Button
          className="bold"
          onClick={() => handleChangeFormat("bold")}
          tooltip="Bold text"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.bold }} />
        </Button>
        <Button
          className="italic"
          onClick={() => handleChangeFormat("italic")}
          tooltip="Italic text"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.italic }} />
        </Button>
        <Button
          className="strike"
          onClick={() => handleChangeFormat("strike")}
          tooltip="Strike text"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.strike }} />
        </Button>
        <div className="color-picker-container">
          <Button
            className="text-color"
            onClick={(e) => {
              setColorType("text");
              textColorRef.current.toggle(e);
            }}
            tooltip="Color text"
            tooltipOptions={tooltipOptions}
          >
            <div dangerouslySetInnerHTML={{ __html: icons.color }} />
          </Button>
          <OverlayPanel ref={textColorRef}>
            <ColorPicker
              color={getCellStyle().color}
              onChange={handleChangeColor}
              theme={themes.dark}
              presets={predefinedColors}
            />
          </OverlayPanel>
        </div>
        <div className="color-picker-container">
          <Button
            className="background-color"
            onClick={(e) => {
              setColorType("background");
              backgroundColorRef.current.toggle(e);
            }}
            tooltip="Background color"
            tooltipOptions={tooltipOptions}
          >
            <div dangerouslySetInnerHTML={{ __html: icons.background }} />
          </Button>
          <OverlayPanel ref={backgroundColorRef}>
            <ColorPicker
              color={getCellStyle().backgroundColor}
              onChange={handleChangeColor}
              theme={themes.dark}
              presets={predefinedColors}
            />
          </OverlayPanel>
        </div>
        <Button
          className="align-left"
          onClick={() => handleTextAlign("left")}
          tooltip="Align left"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.alignLeft }} />
        </Button>
        <Button
          className="align-center"
          onClick={() => handleTextAlign("center")}
          tooltip="Align center"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.alignCenter }} />
        </Button>
        <Button
          className="align-right"
          onClick={() => handleTextAlign("right")}
          tooltip="Align right"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.alignRight }} />
        </Button>
        <Button
          className="clear"
          onClick={handleClearFormatting}
          tooltip="Clear styling"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.clean }} />
        </Button>
        <Button
          className="mergeCells"
          onClick={handleMergeCells}
          tooltip="Merge cells"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.tableMergeCells }} />
        </Button>
        <Button
          className="unmergeCells"
          onClick={handleUnmergeCells}
          tooltip="Unmerge cells"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.tableUnmergeCells }} />
        </Button>
        <Button
          className="insertRow"
          onClick={handleInsertRow}
          tooltip="Insert row"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.tableInsertRow }} />
        </Button>
        <Button
          className="insertColumn"
          onClick={handleInsertColumn}
          tooltip="Insert column"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.tableInsertColumn }} />
        </Button>
        <Button
          className="removeRows"
          onClick={handleRemoveRows}
          tooltip="Remove rows" 
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.tableDeleteRows }} />
        </Button>
        <Button
          className="removeColumns"
          onClick={handleRemoveColumns}
          tooltip="Remove columns"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.tableDeleteColumns }} />
        </Button>
      </div>
    </div>
  );
};

export default SpreadsheetToolbar;
