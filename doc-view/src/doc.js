import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setConfig, sendConfigToEditor } from "./redux/config";
import { setMessageHandler } from './utils/communicate';
import SideBar from "./components/sidebar/SideBar";
import Page from "./components/page";
import "./Doc.css";
import "semantic-ui-css/semantic.min.css";
import "./quill.snow.css"

function Doc({configURL}) {
  // Redux hooks
  const dispatch = useDispatch();

  // Local states and refs
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const pageRef = useRef(null);
  const sidebarRef = useRef(null);

  // Check if the pageRef element's x start is inside sidebarRef
  // Hide sidebar if so
  useEffect(() => {
    window.addEventListener("resize", checkOverlap);
    window.addEventListener("scroll", checkOverlap);
    // Initial check
    checkOverlap();
    return () => {
      window.removeEventListener("resize", checkOverlap);
      window.removeEventListener("scroll", checkOverlap);
    };
  }, []);

  // Handle messages from Doc Editor
  useEffect(() => {
    return setMessageHandler(dispatch);
  }, [dispatch]);

  // Fetch config on component mount and when configURL changes
  useEffect(() => {
    fetchConfig(configURL);
  }, [configURL]);

  // Check overlap on zoom level changed
  useEffect(() => {
    checkOverlap();
  }, [zoomLevel]);

  // Handle page zoom level in and out
  const handleZoomIn = () => {
    setZoomLevel((prevZoomLevel) => Math.min(prevZoomLevel + 0.1, 3));
  };
  const handleZoomOut = () => {
    setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel - 0.1, 0.5));
  };

  // Helper function to check if page overlaps the sidebar
  const checkOverlap = () => {
    if (sidebarRef.current && pageRef.current) {
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const pageRect = pageRef.current.getBoundingClientRect();
      if (pageRect.left < sidebarRect.right*1.2) {
        setIsSidebarHidden(true);
      } else {
        setIsSidebarHidden(false);
      }
    }
  };

  // Fetch config
  const fetchConfig = (url) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`
          );
        }
        return response.json();
      })
      .then((json) => {
        dispatch(setConfig(json));
        dispatch(sendConfigToEditor()); // Send Config to Editor App
      })
      .catch((error) =>
        console.warn(`Failed to fetch config from ${url}:`, error)
      );
  };

  return (
    <div className="lumi-doc-view-root">
      <SideBar ref={sidebarRef} isHidden={isSidebarHidden} />
      <Page pageRef={pageRef} zoomLevel={zoomLevel} />
      <div className="zoom-buttons">
        <button className="zoom-button" onClick={handleZoomIn}>+</button>
        <button className="zoom-button" onClick={handleZoomOut}>-</button>
      </div>
    </div>
  );
}
export default Doc;
