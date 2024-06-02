import React from "react";
import PropTypes from "prop-types";
import "./container.css";
import { renderChild } from "../utils/renderChild";

const ContainerObject = React.memo(({ id, items }) => {
  return (
    <div id={id} className="lumi-doc-view-ContainerObject">
      {items.map(item => renderChild(item))}
    </div>
  );
});

ContainerObject.propTypes = {
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
};

export default ContainerObject;
