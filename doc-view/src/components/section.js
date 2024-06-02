import React from "react";
import PropTypes from "prop-types";
import "./section.css";
import { renderChild } from "../utils/renderChild";
import { randomID } from "../utils/functions";

const SectionTitle = ({ index, title, underline }) => {
  const content = index ? `${index.toString()}. ${title}` : title;
  return underline ? <u>{content}</u> : <>{content}</>;
};

const SectionObject = React.memo(({ id, title, index, underline, items }) => {
  return (
    <div id={id} className="lumi-doc-view-SectionObject">
      <h3 className="lumi-doc-view-SectionObject-title">
        <SectionTitle index={index} title={title} underline={underline} />
      </h3>
      <div className="lumi-doc-view-SectionObject-content">
        {items.map((item) => (
          <React.Fragment key={item.id || item.key || randomID(20)}>
            {renderChild(item)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

SectionObject.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  underline: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
};

export default SectionObject;