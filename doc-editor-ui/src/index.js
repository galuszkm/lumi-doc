import React from 'react';
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import './index.css';
import App from './App';

const root = document.getElementsByTagName("lumiDocEditor")[0]
const docURL = root.getAttribute("docURL"); // Extract document docURL


const rootFrame = createRoot(root);
rootFrame.render(
  <React.StrictMode>
    <Provider store={store}>
      <App docURL={docURL}/>
    </Provider>
  </React.StrictMode>
);
