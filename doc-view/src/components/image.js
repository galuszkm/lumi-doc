import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectSettings, selectItemIndex } from "../redux/config";
import { handleItemClick } from "../utils/functions";
import { Popup } from "semantic-ui-react";
import "./image.css";

const ImageObject = React.memo(({ id, title, url, width, showTitle, maxHeight }) => {
  // Selectors
  const itemIdx = useSelector(state => selectItemIndex(state, 'ImageObject', id));
  const settings = useSelector(selectSettings);

  // Styles from settings
  const styleTitle = settings.image?.title;

  // State to handle image loading error
  const [error, setError] = useState(false);

  // Handle item click
  const handleClick = () => handleItemClick(id, 'ImageObject');

  // Determine styles for the image element
  const getStyle = () => (maxHeight ? { maxHeight: `${maxHeight}px` } : { width: `${width}%` });

  // Determine image URL
  const getURL = () => {
    if (url.startsWith('http')){
      return url
    } else {
      const href = window.location.href
      const prefix = href.endsWith('index.html') ? href.replace('index.html', '') : href;
      const suffix = url.startsWith('/') ? url.slice(1) : url
      return prefix + suffix
    }
  }

  // Render the main image component
  const renderInner = () => (
    <div id={id} className="lumi-doc-view-ImageObject" onClick={handleClick}>
      <img
        className="lumi-doc-view-ImageObject"
        src={getURL()}
        style={getStyle()}
        onError={() => setError(true)}
        onLoad={() => setError(false)}
        alt={title}
      />
      {showTitle && (
        <p className="lumi-doc-view-ImageObject" style={styleTitle}>
          <b>{`Figure ${itemIdx}`}</b>: <span dangerouslySetInnerHTML={{ __html: title }} />
        </p>
      )}
    </div>
  );

  // Render the error popup when image fails to load
  const renderError = () => (
    <Popup
      content={
        <div className="error-content">
          Could not load image "{url}". Please verify "url" property.
        </div>
      }
      trigger={<div className="errorItem">{renderInner()}</div>}
      className="lumi-doc-view-ImageObject-error"
      hideOnScroll
      position="top center"
      wide="very"
    />
  );

  // Conditionally render based on error state
  return error ? renderError() : renderInner();
});

ImageObject.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  url: PropTypes.string.isRequired,
  width: PropTypes.number,
  showTitle: PropTypes.bool,
  maxHeight: PropTypes.string,
};

export default ImageObject;
