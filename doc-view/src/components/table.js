import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Table } from "semantic-ui-react";
import { handleItemClick } from "../utils/functions";
import { useSelector } from "react-redux";
import { selectSettings, selectItemIndex } from "../redux/config";
import { validCSSProperties } from "./table_cell_css_props";
import "./table.css";

const TableObject = React.memo(({ id, title, width, data, size, cellProps, showTitle }) => {
  // Selectors
  const itemIdx = useSelector(state => selectItemIndex(state, 'TableObject', id));
  const settings = useSelector(selectSettings)

  // Styles from settings
  const styleHeaderCell = settings.table.headerCell;
  const styleBodyCell = settings.table.bodyCell;
  const styleTitle = settings.table.title;

  // Handle click event
  const handleClick = () => handleItemClick(id, "TableObject");

  // Memoized calculation of span_matrix and cellProps_matrix
  const { span_matrix, cellProps_matrix } = useMemo(() => {
    // Initialize matrices
    const spanMatrix = data.map(row => row.map(() => [1, 1]));
    const cellPropsMatrix = data.map(row => row.map(() => ({})));

    if (Array.isArray(cellProps)) {
      cellProps.forEach(i => {
        const { row, column, style = {}, rowSpan, colSpan } = i;
        if (
          typeof row === 'number' &&
          typeof column === 'number' &&
          row < spanMatrix.length &&
          column < spanMatrix[row].length &&
          typeof i === 'object'
        ) {
          // Filter valid cell CSS props
          cellPropsMatrix[row][column] = filterCSSProperties(style);

          // Set row and col span of cell
          const maxRowSpan = typeof rowSpan === 'number' && rowSpan > 0 ? rowSpan : 1;
          const maxColSpan = typeof colSpan === 'number' && colSpan > 0 ? colSpan : 1;
          spanMatrix[row][column] = [maxRowSpan, maxColSpan];
    
          // Set row and column span to 0 for covered cells
          for (let r = 0; r < maxRowSpan; r++) {
            for (let c = 0; c < maxColSpan; c++) {
              if (r !== 0 || c !== 0) { // Skip the original cell
                if (spanMatrix[row + r] && spanMatrix[row + r][column + c]) {
                  spanMatrix[row + r][column + c] = [0, 0];
                }
              }
            }
          }
        }
      });
    }
    return { span_matrix: spanMatrix, cellProps_matrix: cellPropsMatrix };
  }, [cellProps, data]);

  function filterCSSProperties(obj) {
    const filtered = {};
    for (const key in obj) {
      if (validCSSProperties.has(key)) {
        filtered[key] = obj[key];
      }
    }
    return filtered;
  }

  const renderHead = () => {
    if (data && data.length > 0) {
      const _span = span_matrix[0];
      const _size = size && size.length === data[0].length ? size : null;
      const _cellProps = cellProps_matrix[0];

      return (
        <Table.Header className="lumi-doc-view-TableObject-header">
          <Table.Row className="lumi-doc-view-TableObject-header-row">
            {data[0].map((cellContent, idx) => {
              const [rowSpan, colSpan] = _span[idx];
              // Skip cell if column span is 0
              if (colSpan === 0){
                return (
                  <Table.HeaderCell
                    className="lumi-doc-view-TableObject-header-cell"
                    key={idx}
                    style={{display: 'none'}}
                  />
                )
              };
              // Return cell
              const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(cellContent);
              return (
                <Table.HeaderCell
                  className="lumi-doc-view-TableObject-header-cell"
                  key={idx}
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                  style={{
                    ...styleHeaderCell, 
                    ...{ width: _size ? `${_size[idx]}%` : undefined },
                    ..._cellProps[idx],
                  }}
                >
                  { hasHtmlTags ? 
                    <span dangerouslySetInnerHTML={{ __html: cellContent }} /> :
                    <>{cellContent}</>
                  }
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
      );
    }
    return  (
      <Table.Header className="lumi-doc-view-TableObject-header">
        <Table.Row className="lumi-doc-view-TableObject-header-row"/>
      </Table.Header>
    )
  };

  const renderBody = () => {
    if (data && data.length > 1) {
      const _span = span_matrix.slice(1);
      const _cellProps = cellProps_matrix.slice(1);

      return (
        <Table.Body>
          {data.slice(1).map((row, rowIdx) => {
            const span_row = _span[rowIdx];
            return (
              <Table.Row key={rowIdx} className="lumi-doc-view-TableObject-row">
                {row.map((cellContent, colIdx) => {
                  const [rowSpan, colSpan] = span_row[colIdx]
                  // Skip cell if row or column span is 0
                  if (rowSpan === 0 || colSpan === 0){
                    return (
                      <Table.Cell
                        className="lumi-doc-view-TableObject-cell"
                        key={colIdx}
                        style={{display: 'none'}}
                      />
                    )
                  }
                  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(cellContent);
                  return (
                    <Table.Cell
                      className="lumi-doc-view-TableObject-cell"
                      key={colIdx}
                      style={{
                        ...styleBodyCell,
                        ..._cellProps[rowIdx][colIdx],
                      }}
                      rowSpan={rowSpan}
                      colSpan={colSpan}
                    >
                      { hasHtmlTags ? 
                        <span dangerouslySetInnerHTML={{ __html: cellContent }} /> :
                        <>{cellContent}</>
                      }
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      );
    } 
    return (
      <Table.Body>
        <Table.Row className="lumi-doc-view-TableObject-row" />
      </Table.Body>
    )
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
  width: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))).isRequired,
  size: PropTypes.arrayOf(PropTypes.number),
  cellProps: PropTypes.arrayOf(PropTypes.object),
  showTitle: PropTypes.bool.isRequired,
};


export default TableObject;
