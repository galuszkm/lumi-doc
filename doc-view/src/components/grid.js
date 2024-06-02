import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./grid.css";
import { renderChild } from "../utils/renderChild";
import { Popup } from "semantic-ui-react";

const GridObject = React.memo(({ id, items }) => {
  const [error, setError] = useState(false);

  // Set error if total width of all columns is greater than 100%
  useEffect(() => {
    const totalWidth = items.reduce((sum, item) => sum + (item.width || 0), 0);
    setError(totalWidth > 100);
  }, [items]);

  const renderInner = () => (
    <div id={id} className="lumi-doc-view-GridObject">
      {items.filter(item => item.type === 'GridColumnObject').map(item => renderChild(item))}
    </div>
  );

  const renderError = () => (
    <Popup
      content={
        <div className="error-content">
          Total width of this grid's columns exceeds 100%. Please verify columns width.
        </div>
      }
      trigger={<div className="errorItem">{renderInner()}</div>}
      className="lumi-doc-view-GridObject-error"
      hideOnScroll
      position="top center"
      wide="very"
    />
  );

  return error ? renderError() : renderInner();
});

GridObject.propTypes = {
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
};

export default GridObject;
