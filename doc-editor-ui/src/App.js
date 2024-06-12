import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  validateSession, 
  selectIsValidSession, 
  selectSessionDocURL, 
  selectSessionID, 
  checkUpload, 
  getSessionConfig, 
  getSessionResources
} from './redux/session';
import Split from "react-split";
import Toolbox from "./components/Toolbox";
import { RefProvider, useRefContext } from "./context/RefContext";
import { setMessageHandler } from "./utils/communicate";
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-dark-blue/theme.css';  // or another dark theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "./App.css";

const AppContent = ({ requestURL, sessionID }) => {

  // Redux hooks
  const dispatch = useDispatch();
  const iframeRef = useRefContext();
  const currentSessionID = useSelector(selectSessionID);
  const currentSessionDocURL = useSelector(selectSessionDocURL);
  const currentSessionIsValid = useSelector(selectIsValidSession);

  // Handle message from iframe
  useEffect(() => {
    // Validate session and check backend responses
    dispatch(validateSession({ requestURL, sessionID }));
    dispatch(checkUpload({ requestURL }));
    dispatch(getSessionConfig({ requestURL, sessionID }));
    dispatch(getSessionResources({ requestURL, sessionID }));
    return setMessageHandler(dispatch);
  }, [dispatch, sessionID, requestURL]);

  const render = () => {
    if (currentSessionIsValid) {
      return (
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
            src={currentSessionDocURL}
            ref={iframeRef}
          />
          <Toolbox />
        </Split>
        
      );
    } else {
      return (
        <div className="lumi-doc-editor-error">
          <h1>
            Could not load document
            {currentSessionID !== null ?? (
              <>
                <br /> Session ID:
                <span style={{ color: "#00ABF5", marginLeft: "10px"}}>
                  {currentSessionID}
                </span>
              </>
            )}
          </h1>
        </div>
      );
    }
  };

  return (
    <div className="lumi-doc-editor-root">
      {render()}
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
