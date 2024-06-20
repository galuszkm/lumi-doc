import React from "react";
import { useSelector } from "react-redux";
import { selectSettings, selectHeader, selectItems, selectFooter } from "../redux/config";
import { renderChild } from "../utils/renderChild";
import "./page.css";

function Page({ pageRef, zoomLevel }) {

  // Selectors
  const settings = useSelector(selectSettings);
  const header = useSelector(selectHeader);
  const items = useSelector(selectItems);
  const footer = useSelector(selectFooter);

  // Border CSS class
  const pageBorderClass = settings.page.borderStyle && settings.page.borderStyle !== 'none' ? 'border' : '';

  const renderHeader = () => {
    if (header.type === 'table' && Array.isArray(header.table)) {
      return renderHeaderTable()
    } else if (header.type === "title") {
      return (
        <h1
          className={`lumi-doc-view-header-title ${pageBorderClass}`}
          style={header.title?.style || {}}
        >
          {header.title?.text || ""}
        </h1>
      );
    }
    return <></>;
  }

  const renderHeaderTable = () => {
    // Create a map to track covered cells
    const coveredCells = {};
    header.table.forEach((row, rdx) => {
      row.forEach((cell, cdx) => {
        const { rowSpan = 1, colSpan = 1 } = cell;
        for (let r = rdx; r < rdx + rowSpan; r++) {
          for (let c = cdx; c < cdx + colSpan; c++) {
            if (r !== rdx || c !== cdx) {
              coveredCells[`${r}-${c}`] = true;
            }
          }
        }
      });
    });
    // Table border class
    const tableBorderClass = settings.page.borderStyle && settings.page.borderStyle !== 'none' ? '' : 'border';
    return (
      <table className={`lumi-doc-view-page-header-table ${tableBorderClass}`} key="lumi-doc-view-page-header">
        <tbody>
          {header.table.map((row, rdx) => (
            <tr key={rdx} className="lumi-doc-view-page-header-table-row">
              {row.map((cell, cdx) => {
                const isCovered = coveredCells[`${rdx}-${cdx}`];
                return renderHeaderTableCell(cell || { value: null }, cdx, isCovered ? 'hidden' : null);
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const renderHeaderTableCell = (cell, cdx, hidden) => {
    // Content of the cell - pure html or text
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(cell.value);
    const innerHTML = hasHtmlTags ? <span dangerouslySetInnerHTML={{ __html: cell.value }} /> : cell.value;
    const style = { ...cell.style, ...(hidden && { display: 'none' }) };
  
    return (
      <td
        className="lumi-doc-view-page-header-table-cell"
        key={cdx}
        rowSpan={cell.rowSpan || 1}
        colSpan={cell.colSpan || 1}
        style={style}
      >
        {innerHTML}
      </td>
    );
  }

  const renderFooter = () => {
    return <></>
  }

  return (
    <div
      id="page"
      className="lumi-doc-view-page"
      style={{ width: settings.page.width, transform: `scale(${zoomLevel})`}}
    >
      <div ref={pageRef} style={{ ...settings.page, width: "unset" }}>
        {renderHeader()}
        <div className={`lumi-doc-view-page-items ${pageBorderClass}`}>
          {items.map((i) => renderChild(i))}
        </div>
        {renderFooter()}
      </div>
    </div>
  );
}

export default Page
