import React from "react";
import PropTypes from "prop-types";
import { renderChild } from "../utils/renderChild";
import "./list.css";

const ListObject = React.memo(({ id, listStyle, items }) => {
  
  const getIndex = (idx) => {
    if (listStyle === "bullet") {
      return '\u2022'
    } else if (listStyle === "number") {
      return `${idx + 1}.`
    } else if (listStyle === "dash") {
      return '\u2013'
    }
  }

  return (
    <div key={id} id={id} className="lumi-doc-view-ListObject">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="lumi-doc-view-ListObject-item">
          <div className={`lumi-doc-view-ListObject-item-index ${listStyle}`}>
            {getIndex(idx)}
          </div>
          <div className="lumi-doc-view-ListObject-item-content">
            {renderChild(item)}
          </div>
        </div>
      ))}
    </div>
    
  );
});

ListObject.propTypes = {
  id: PropTypes.string.isRequired,
  listStyle: PropTypes.oneOf(['bullet', 'number', 'dash']),
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ListObject;
