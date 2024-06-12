import React, { useState } from "react";
import { Button } from "primereact/button";
import './Toolbox.css';
import TreeView from "./TreeView";
import ResourcesTab from "./ResourcesTab";

function Toolbox() {
  
  // Local states
  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return <div className="lumi-doc-editor-toolbox-tab"><TreeView /></div>;
      case 2:
        return <div className="lumi-doc-editor-toolbox-tab"><ResourcesTab /></div>;
      default:
        return <div className="lumi-doc-editor-toolbox-tab"></div>;
    }
  };
  
  return (
    <div className="lumi-doc-editor-toolbox">
      <div className="lumi-doc-editor-toolbox-menu">
        <Button
          className={activeIndex===0 ? "selected" : ""}
          icon="pi pi-sitemap"
          label="Content"
          onClick={() => setActiveIndex(0)}
        />
        <Button
          className={activeIndex===1 ? "selected" : ""}
          icon="pi pi-cog"
          label="Page settings"
          onClick={() => setActiveIndex(1)}
        />
        <Button
          className={activeIndex===2 ? "selected" : ""}
          icon="pi pi-upload"
          label="Resources"
          onClick={() => setActiveIndex(2)}
        />
        <Button
          className={activeIndex===3 ? "selected" : ""}
          icon="pi pi-sliders-h"
          label="Options"
          onClick={() => setActiveIndex(3)}
        />
      </div>
      {renderContent()}
    </div>
  );
}

export default Toolbox