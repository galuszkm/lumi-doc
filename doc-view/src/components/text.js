import React from "react";
import PropTypes from "prop-types";
import { handleItemClick } from "../utils/functions";
import "./text.css";

const TextObject = React.memo(({ id, text, html }) => {
  const handleClick = () => handleItemClick(id, 'TextObject');

  return html ? (
    <div
      id={id}
      className="lumi-doc-view-TextObject"
      dangerouslySetInnerHTML={{ __html: text }}
      onClick={handleClick}
    />
  ) : (
    <TextareaAutoHeight id={id} text={text} />
  );
});

const TextareaAutoHeight = ({ text, id }) => {
  const setTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleClick = () => handleItemClick(id, 'TextObject');

  return (
    <textarea
      id={id}
      className="lumi-doc-view-TextObject"
      value={text}
      ref={setTextareaHeight}
      rows={1}
      spellCheck={false}
      readOnly={true}
      onClick={handleClick}
    />
  );
};

TextObject.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  html: PropTypes.bool,
};

TextareaAutoHeight.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default TextObject;