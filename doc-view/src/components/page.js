import React from "react";
import { useSelector } from "react-redux";
import { selectSettings, selectHeader, selectItems, selectFooter } from "../redux/config";
import { renderChild } from "../utils/renderChild"
import "./page.css";

function Page({ pageRef, zoomLevel }) {

  // Selectors
  const settings = useSelector(selectSettings);
  const header = useSelector(selectHeader);
  const items = useSelector(selectItems);
  const footer = useSelector(selectFooter);
  
  function renderHeaderCell(cell, cdx) {
    // Content of the cell - pure html or text
    const innerHTML = cell.html ? <span dangerouslySetInnerHTML={{ __html: cell.html }} /> : cell.text;
    return (
      <td
        className="lumi-doc-view-page-header-table-cell"
        key={cdx}
        rowSpan={cell.rowSpan}
        colSpan={cell.colSpan}
        style={cell.style}
      >
        {innerHTML}
      </td>
    );
  }

  function renderHeader(){
    if (header.type === 'table'){
      // Table rows
      const rows = header.table.rows;
      // Table CSS class for borders
      const borderClass =  (
        settings.page.borderStyle && settings.page.borderStyle !== "none"
        ? "" : "border"
      )

      return (
        <table
          className={`lumi-doc-view-page-header-table ${borderClass}`}
          key="lumi-doc-view-page-header"
        >
          <tbody>
            {rows.map((row, rdx) => (
              <tr key={rdx} className="lumi-doc-view-page-header-table-row">
                {row.cells.map((cell, cdx) => renderHeaderCell(cell, cdx))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <></>
  }

  function renderFooter(){
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
        <div className="lumi-doc-view-page-items">
          {items.map((i) => renderChild(i))}
        </div>
        {renderFooter()}
      </div>
    </div>
  );
}

export default Page
