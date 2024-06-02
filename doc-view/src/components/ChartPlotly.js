import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "semantic-ui-react";
import plotlyLib from "plotly.js-dist/plotly";
import createPlotlyComponent from "react-plotly.js/factory";
import './chart.css';

// Default configuration values
const dflt = {};
// *data*
dflt.dataItem = {
  x: [],
  y: [],
  xaxis: "x",
  yaxis: "y",
  name: "new data",
  type: "line",
  mode: "lines",
  line: {
    dash: "solid",
    width: 1,
    shape: "spline",
  },
  hovertemplate: "%{y}",
};
dflt.axis = {
  title: {
    text: "axis label",
    standoff: 5,
    font: {
      family: "Lato",
      color: "black",
      size: 14,
    },
  },
  nticks: undefined,
  ticklen: 10,
  tickcolor: "rgb(240,240,240)",
  tickfont: {
    family: "Lato",
    color: "black",
    size: 14,
  },
  tickformat: "f",
  zeroline: false,
  showline: true,
  linecolor: "rgb(200,200,200)",
  showspikes: true,
  spikethickness: 1,
  spikedash: "10px, 7px",
  spikecolor: "grey",
  mirror: true,
};
// *layout*
dflt.layout = {
  width: undefined,
  height: undefined,
  autosize: true,
  margin: { l: 70, r: 10, b: 60, t: 30 },
  showlegend: true,
  legend: {
    x: 0.0,
    y: 1.01,
    xanchor: 'auto',
    yanchor: "bottom",
    orientation: "h",
    font: {
      family: "Lato",
      color: "black",
      size: 12,
    },
  },
  hovermode: "x",
  hoverdistance: 25,
  hoverlabel: {
    bgcolor: "white",
    bordercolor: "grey",
    font: {
      family: "Lato",
      color: "black",
      size: 12,
    },
    align: "right",
  },
  title: {
    text: "   ",
    font: {
      family: "Lato",
      color: "black",
      size: 18,
    },
    x: 0.1,
    xanchor: "left",
  },
  cartesianSpikesEnabled: "on",
  dragmode: "pan",
  xaxis: dflt.axis,
  yaxis: dflt.axis,
};
// *config*
dflt.config = {
  modeBarButtonsToAdd: [],
  scrollZoom: true,
  modeBarButtonsToRemove: [
    "lasso2d",
    "select2d",
    "autoScale2d",
    "toggleSpikelines",
    "zoomIn2d",
    "zoomOut2d",
  ],
  displaylogo: false,
  showEditInChartStudio: true,
  plotlyServerURL: "https://chart-studio.plotly.com",
  displayModeBar: true,
  editable: false,
};

export {dflt}

const Plot = createPlotlyComponent(plotlyLib);

const ChartPlotly = ({ data, layout, config }) => {
  const [open, setOpen] = useState(false);
  const [modeBarVisible, setModeBarVisible] = useState(false);
  const chartBoxRef = useRef(null);

  const popBtn = {
    name: "Popout",
    icon: plotlyLib.Icons.autoscale,
    click: () => setOpen(true),
  };
  const modeBarButtonsToAdd = [...config.modeBarButtonsToAdd, popBtn];
  const configExt = { ...config, modeBarButtonsToAdd };

  const handleMouseMove = (event) => {
    const chartBox = chartBoxRef.current;
    if (chartBox && !open) {
      const rect = chartBox.getBoundingClientRect();
      const isMouseOver = (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
      setModeBarVisible(isMouseOver);
    }
  };

  const renderModal = () => (
    <Modal
      style={{
        width: "80%",
        height: "80vh",
        padding: "20px",
        left: "10%",
        top: "10vh",
        textAlign: "center",
        verticalAlign: "middle",
      }}
      centered
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Plot
        data={data}
        layout={{ ...layout, xaxis: { ...layout.xaxis, domain: [0.0, 1.0] } }}
        config={{ ...config, displayModeBar: true }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
    </Modal>
  );

  return (
    <div
      ref={chartBoxRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseMove}
      style={{ height: '100%' }}
    >
      <Plot
        data={data}
        layout={layout}
        config={{ ...configExt, displayModeBar: modeBarVisible }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
      {open && renderModal()}
    </div>
  );
};

ChartPlotly.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  layout: PropTypes.object,
  config: PropTypes.object,
};

export default ChartPlotly;