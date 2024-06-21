import React from 'react';
import { createRoot } from "react-dom/client";
// import { Provider } from "react-redux";
// import store from "./redux/store";
import App from './App';
import './index.css';

// Get the root element
const root = document.getElementsByTagName("lumiSessionManager")[0];

// Extract sessionURL
const requestURL = root.getAttribute("requestURL");

const rootFrame = createRoot(root);
rootFrame.render(
  // <Provider store={store}>
    <App requestURL={requestURL} />
  // </Provider>
);
