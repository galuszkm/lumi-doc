import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import Doc from "./Doc";
import "./index.css"

// Attach to side
const root = document.getElementsByTagName("lumiDocView")[0]
const configURL = root.getAttribute("configURL"); // Extract the configURL attribute

const rootFrame = createRoot(root);
rootFrame.render(
  <Provider store={store}>
    <Doc configURL={configURL}/>
  </Provider>
);

