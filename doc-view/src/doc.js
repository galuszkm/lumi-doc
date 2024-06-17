import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConfig, sendConfigToEditor } from "./redux/config";
import { setMessageHandler } from './utils/communicate';
import SideBar from "./components/sidebar/SideBar";
import Page from "./components/page";
import "./doc.css";
import "semantic-ui-css/semantic.min.css";
import "./quill.snow.css"

function Doc({configURL}) {
  
  // Redux hooks
  const dispatch = useDispatch()

  // Handle messages from Doc Editor
  useEffect(() => {
    return setMessageHandler(dispatch)
  }, [dispatch]);

  // Fetch config on component mount and when configURL changes
  useEffect(() => {
    fetchConfig(configURL);
  }, [configURL]);

  // Fetch config
  function fetchConfig(url) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        dispatch(setConfig(json));
        dispatch(sendConfigToEditor()); // Send Config to Editor App
      })
      .catch(error => console.warn(`Failed to fetch config from ${url}:`, error));
  }

  return (
    <>
      <SideBar />
      <Page />
    </>
  ) 
}
export default Doc;
