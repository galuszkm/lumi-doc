import React from "react";
import PropTypes from "prop-types";
import { Table } from "semantic-ui-react";
import { handleItemClick } from "../utils/functions";
import { useSelector } from "react-redux";
import { selectSettings, selectItemIndex } from "../redux/config";
import "./table.css";

const TableObject = React.memo(({ id, title, width, data, color, spans, size, showTitle }) => {
  // Selectors
  const itemIdx = useSelector(state => selectItemIndex(state, 'TableObject', id));
  const settings = useSelector(selectSettings)

  // Styles from settings
  const styleHeaderCell = settings.table.headerCell;
  const styleBodyCell = settings.table.bodyCell;
  const styleTitle = settings.table.title;

  // Handle click event
  const handleClick = () => handleItemClick(id, "TableObject");

  // Deep copy the spans array to avoid mutating the original
  const deepCopySpans = spans ? JSON.parse(JSON.stringify(spans)) : null;

  const renderHead = () => {
    const _spans = deepCopySpans ? deepCopySpans[0] : [];
    const _size = size && size.length === data[0].length ? size : null;
    const _color = color ? color[0] : null;

    return (
      <Table.Header className="lumi-doc-view-TableObject-header">
        <Table.Row className="lumi-doc-view-TableObject-header-row">
          {data[0].map((cellContent, idx) => {
            const [rowSpan, colSpan] = _spans[idx] || [1, 1];
            if (colSpan === 0) return null;
            if (colSpan > 1) {
              for (let j = 1; j < colSpan; j++) {
                if (_spans[idx + j]) {
                  _spans[idx + j][1] = 0;
                }
              }
            }
            // Cell background color
            let cellColor = null
            try {
              cellColor = Array.isArray(_color[idx]) ? `rgba(${_color[idx].join(",")})` : null;
            } catch {
              // Print error only if colors are provided (this is optional arg)
              if (color){
                console.log(`Error: Missing color data at header col ${idx}. Table ${title} (id: ${id})`);
              }
            }

            return (
              <Table.HeaderCell
                className="lumi-doc-view-TableObject-header-cell"
                key={idx}
                rowSpan={rowSpan}
                colSpan={colSpan}
                style={{
                  ...styleHeaderCell, 
                  ...{ width: _size ? `${_size[idx]}%` : undefined },
                  backgroundColor: cellColor ? cellColor : null,
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: cellContent }} />
              </Table.HeaderCell>
            );
          })}
        </Table.Row>
      </Table.Header>
    );
  };

  const renderBody = () => {
    const _spans = deepCopySpans ? deepCopySpans.slice(1) : null;
    const borderCells = _spans ? data.slice(1).map(i => i.map(j => '')) : null;
    const colorCells = color ? color.slice(1) : data.slice(1).map(i => i.map(j => [255,255,255]));

    return (
      <Table.Body>
        {data.slice(1).map((row, rowIdx) => {
          const rowSpans = _spans ? _spans[rowIdx] : [];
          return (
            <Table.Row
              key={rowIdx}
              className={rowIdx === data.length - 2 ? "lumi-doc-view-TableObject-row last" : "lumi-doc-view-TableObject-row"}
            >
              {row.map((col, colIdx) => {
                let [rowSpan, colSpan] = [1,1]
                try {
                  [rowSpan, colSpan] = rowSpans[colIdx]
                } catch {
                  // Print error only if spans are provided (this is optional arg)
                  if (spans){
                    console.log(`Error: Missing span data at row ${rowIdx}, col ${colIdx}. Table ${title} (id: ${id})`);
                  }
                }
                // Skip cell if row or column span is 0
                if (rowSpan === 0 || colSpan === 0) return null;
                // Set column span to 0 in all cells covered by this cell
                if (colSpan > 1) {
                  for (let j = 1; j < colSpan; j++) {
                    if (_spans[rowIdx][colIdx + j]) {
                      _spans[rowIdx][colIdx + j][1] = 0;
                    }
                  }
                }
                // Overwrite row span and left border of all cells covered by this cell
                if (rowSpan > 1) {
                  for (let i = 1; i < rowSpan; i++) {
                    if (_spans[rowIdx + i]) {
                      _spans[rowIdx + i][colIdx][0] = 0;
                      if (borderCells) borderCells[rowIdx + i][colIdx + 1] = '1px solid rgba(34, 36, 38, 0.1)';
                      // Overwrite column span and left border of all cells covered by this cell 
                      if (colSpan > 1) {
                        for (let j = 1; j < colSpan; j++) {
                          if (_spans[rowIdx + i][colIdx + j]) {
                            _spans[rowIdx + i][colIdx + j][1] = 0;
                            if (borderCells) borderCells[rowIdx + i][colIdx + j + 1] = '1px solid rgba(34, 36, 38, 0.1)';
                          }
                        }
                      }
                    }
                  }
                }
                // Cell background color
                let cellColor = null
                try {
                  cellColor = Array.isArray(colorCells[rowIdx][colIdx]) ? `rgba(${colorCells[rowIdx][colIdx].join(",")})` : null;
                } catch {
                  // Print error only if colors are provided (this is optional arg)
                  if (color){
                    console.log(`Error: Missing color data at row ${rowIdx}, col ${colIdx}. Table ${title} (id: ${id})`);
                  }
                }

                return (
                  <Table.Cell
                    key={colIdx}
                    style={{
                      ...styleBodyCell,
                      ...{
                      backgroundColor: cellColor ? cellColor : null,
                      borderLeft: borderCells ? borderCells[rowIdx][colIdx] : null,
                    }}}
                    className={
                      rowIdx === data.length - 2 && colIdx === 0
                        ? "lumi-doc-view-TableObject-cell last-row first-cell"
                        : rowIdx === data.length - 2 && colIdx === data[rowIdx].length - 1
                          ? "lumi-doc-view-TableObject-cell last-row last-cell"
                          : "lumi-doc-view-TableObject-cell"
                    }
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                  >
                    <span dangerouslySetInnerHTML={{ __html: col }} />
                  </Table.Cell>
                );
              })}
            </Table.Row>
          );
        })}
      </Table.Body>
    );
  };

  return (
    <div id={id} className="lumi-doc-view-TableObject" onClick={handleClick}>
      {showTitle ? (
          <p className="lumi-doc-view-TableObject" style={styleTitle}>
            <b>{`Table ${itemIdx}`}</b>: <span dangerouslySetInnerHTML={{ __html: title }} />
          </p>
        ) : <></>
      }
      
      <Table
        className="lumi-doc-view-TableObject"
        celled
        unstackable
        style={{ width: `${width}%`, marginLeft: `${(100 - width) / 2}%` }}
      >
        {renderHead()}
        {renderBody()}
      </Table>
    </div>
  );
});

TableObject.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  showTitle: PropTypes.bool.isRequired,
  width: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))).isRequired,
  color: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  spans: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  size: PropTypes.arrayOf(PropTypes.number),
};


export default TableObject;
