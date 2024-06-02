import React from "react";
import PropTypes from "prop-types";
import "./gridColumn.css";
import { renderChild } from "../utils/renderChild";

const GridColumnObject = React.memo(({ id, width, items, marginLeft, marginRight }) => {
  return (
    <div
      id={id}
      className="lumi-doc-view-GridColumnObject"
      style={{
        width: `${width}%`,
        paddingLeft: `${marginLeft}px`,
        paddingRight: `${marginRight}px`,
      }}
    >
      {items.map(item => renderChild(item))}
    </div>
  );
});

GridColumnObject.propTypes = {
  id: PropTypes.string.isRequired,
  width: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.object),
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
};

export default GridColumnObject;
