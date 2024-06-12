import React from 'react';
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import './index.css';
import App from './App';

// Get the root element
const root = document.getElementsByTagName("lumiDocEditor")[0];

// Extract sessionURL
const requestURL = root.getAttribute("requestURL");

// Parse URL parameters
const params = new URLSearchParams(window.location.search);
const sessionID = params.get('sessionID'); // Get the sessionID from the query parameters

const rootFrame = createRoot(root);
rootFrame.render(
  <React.StrictMode>
    <Provider store={store}>
      <App requestURL={requestURL} sessionID={sessionID}/>
    </Provider>
  </React.StrictMode>
);
