import React from "react";
import { useSelector } from "react-redux";
import { selectSettings, selectHeader, selectItems, selectFooter } from "../redux/config";
import { renderChild } from "../utils/renderChild"
import "./page.css";

function Page() {
  // Selectors
  const settings = useSelector(state => selectSettings(state));
  const header = useSelector(selectHeader);
  const items = useSelector(selectItems);
  const footer = useSelector(selectFooter);
  
  // Styles from settings
  const style = settings.page;

  function renderHeaderCell(cell, cdx) {
    // Content of the cell - pure html or text
    const innerHTML = cell.html ? <span dangerouslySetInnerHTML={{ __html: cell.html }} /> : cell.text;
    return (
      <td key={cdx} rowSpan={cell.rowSpan} colSpan={cell.colSpan} style={cell.style}>
        {innerHTML}
      </td>
    );
  }

  function renderHeader(){
    if (header.type === 'table'){
      // Table rows
      const rows = header.table.rows;

      return (
        <table className="lumi-doc-view-page-header-table" key="lumi-doc-view-page-header">
          <tbody>
            {rows.map((row, rdx) => 
              <tr key={rdx}>
                {row.cells.map((cell, cdx) => renderHeaderCell(cell, cdx))}
              </tr>
            )}
          </tbody>
        </table>
      )
    }
    return <></>
  }

  function renderFooter(){
    return <></>
  }

  function pageBorderStyle(){
    // This function is to avoid border overlaying between header, footer and items container 
    if (style.border){
      return {
        border: style.border,
        borderTop: header.type === 'table' ? 'unset' : style.border,
        borderBottom: footer.type === 'table' ? 'unset' : style.border,
      }
    } else {
      return {}
    }
  }

  return(
    <div className="lumi-doc-view-page" id="page" style={{width: style.width}}>
      <div style={{...style, border:'unset', width: 'unset'}}>
        {renderHeader()}
        <div className="lumi-doc-view-page-box-items" style={pageBorderStyle()}>
          {items.map(i => renderChild(i))}
        </div>
        {renderFooter()}
      </div>
    </div>
  )
}

export default Page
