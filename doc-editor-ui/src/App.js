import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Split from "react-split";
import Toolbox from "./components/Toolbox";
import { RefProvider, useRefContext } from "./context/RefContext";
import { setMessageHandler } from "./utils/communicate";
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-dark-blue/theme.css';  // or another dark theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "./App.css";

const AppContent = ({ docURL }) => {
  const dispatch = useDispatch();
  const iframeRef = useRefContext();

  // Handle message from iframe
  useEffect(() => {
    return setMessageHandler(dispatch)
  }, [dispatch]);

  const sendPOST = (newConfig) => {
    fetch("/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newConfig),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(() => {
        window.electron.ipcRenderer.send("update-config", newConfig);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div className="lumi-doc-editor-root">
      <Split
        className="flex"
        sizes={[70, 30]}
        minSize={100}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        style={{ display: "flex", width: "100%", backgroundColor: "black" }}
      >
        <iframe
          className="lumi-doc-editor-iframe"
          src={docURL ? docURL : `${window.location.origin}/doc`}
          ref={iframeRef}
        />
        <Toolbox />
      </Split>
    </div>
  );
};

const App = (props) => (
  <RefProvider>
    <PrimeReactProvider>
      <AppContent {...props} />
    </PrimeReactProvider>
  </RefProvider>
);

export default App;
