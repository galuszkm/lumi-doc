import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectSettings, selectItemIndex } from "../redux/config";
import { handleItemClick } from "../utils/functions";
import "./model.css";

const ModelObject = React.memo(({ id, title }) => {
  // Selectors
  const itemIdx = useSelector((state) => selectItemIndex(state, "ModelObject", id));
  const settings = useSelector(selectSettings);

  // Styles from settings
  const styleTitle = settings.model?.title;

  // Handle item click
  const handleClick = () => handleItemClick(id, 'ModelObject');

  return (
    <div id={id} className="lumi-doc-view-ModelObject" onClick={handleClick}>
      <h4 className="lumi-doc-view-ModelObject">
        Model Object not implemented yet!
      </h4>
      <p className="lumi-doc-view-ModelObject" style={styleTitle}>
        <b>{`Model ${itemIdx}`}</b>: <span dangerouslySetInnerHTML={{ __html: title }} />
      </p>
    </div>
  )
});

export default ModelObject;
