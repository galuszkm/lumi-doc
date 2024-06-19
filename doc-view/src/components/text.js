import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { handleItemClick } from "../utils/functions";
import { selectSettingsPageFontSize } from "../redux/config";
import "./text.css";

const TextObject = React.memo(({ id, text, html }) => {
  // Selectors
  const fontSize = useSelector(selectSettingsPageFontSize);
  
  const handleClick = () => handleItemClick(id, 'TextObject');

  return html ? (
    <div
      id={id}
      className="lumi-doc-view-TextObject"
      dangerouslySetInnerHTML={{ __html: text }}
      onClick={handleClick}
      style={{fontSize: fontSize}}
    />
  ) : (
    <TextareaAutoHeight id={id} text={text} />
  );
});

const TextareaAutoHeight = ({ text, id }) => {
  // Selectors
  const fontSize = useSelector(selectSettingsPageFontSize);

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
      style={{fontSize: fontSize}}
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