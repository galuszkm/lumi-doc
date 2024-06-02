import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectSettings, selectItemIndex } from "../redux/config";
import { handleItemClick, mergeDeep } from "../utils/functions";
import ChartPlotly, {dflt} from './ChartPlotly';
import './chart.css';

const ChartObject = React.memo(({ id, title, showTitle, height, layout, config, data }) => {
  // Selectors
  const itemIdx = useSelector(state => selectItemIndex(state, 'ChartObject', id));
  const settings = useSelector(selectSettings);

  // Styles from settings
  const styleTitle = settings.chart?.title;

  // Handle item click
  const handleClick = () => handleItemClick(id, 'ChartObject');

  return (
    <div id={id} className="lumi-doc-view-ChartObject" onClick={handleClick}>
      <div style={{ height, paddingRight: '5px' }}>
        <ChartPlotly
          data={data.map(item => mergeDeep(dflt.dataItem, item))}
          layout={mergeDeep(dflt.layout, layout)}
          config={mergeDeep(dflt.config, config)}
        />
      </div>
      {showTitle && (
        <p className="lumi-doc-view-ChartObject-title" style={styleTitle}>
          <b>{`Chart ${itemIdx}`}</b>: <span dangerouslySetInnerHTML={{ __html: title }} />
        </p>
      )}
    </div>
  );
});

ChartObject.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  height: PropTypes.string,
  layout: PropTypes.object,
  config: PropTypes.object,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ChartObject;