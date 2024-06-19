import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputText } from 'primereact/inputtext';
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { OverlayPanel } from 'primereact/overlaypanel';
import { ColorPicker, themes } from 'react-pick-color';
import { 
  selectHeader, selectFooter, selectSettingsPage, 
  setSettingsPageWidth, setSettingsPageFontSize,
  setSettingsPageMarginTop, setSettingsPageMarginBottom,
  setSettingsPageMarginLeft, setSettingsPageMarginRight,
  setSettingsPageBorderStyle, setSettingsPageBorderWidth, setSettingsPageBorderColor,
  updateDocSettings,
} from "../../redux/document";
import { useRefContext } from "../../hooks/RefContext";
import "./PageTab.css";

const predefinedColors = [
  '#000000', '#e60000', '#ff9900', '#ffff00', 
  '#008a00', '#0066cc', '#9933ff', '#ffffff'
];

function PageTab() {

  // Redux hooks
  const dispatch = useDispatch();
  const header = useSelector(selectHeader);
  const footer = useSelector(selectFooter);
  const {
    width, fontSize, 
    marginTop, marginBottom, marginLeft, marginRight, 
    borderStyle, borderWidth, borderColor
  } = useSelector(selectSettingsPage);

  // Refs
  const iframeRef = useRefContext();
  const borderColorRef = useRef(null)

  const renderMainSettings = () => {
    return (
      <>
        <div className="lumi-doc-editor-page-row-title">
          General settings
        </div>
        <div className="lumi-doc-editor-page-row">
          <div className="lumi-doc-editor-page-row-item p-inputgroup">
            <span className="lumi-doc-editor-page-label p-inputgroup-addon">
              Page width [mm]
            </span>
            <InputNumber
              className="lumi-doc-editor-page-input"
              placeholder="..."
              value={width}
              onChange={(e) => dispatch(setSettingsPageWidth(e.value))}
              locale="fr-FR"
            />
          </div>
          <div className="lumi-doc-editor-page-row-item p-inputgroup">
            <span className="lumi-doc-editor-page-label p-inputgroup-addon">
              Font size [pt]
            </span>
            <InputNumber
              className="lumi-doc-editor-page-input"
              placeholder="..."
              value={fontSize}
              onChange={(e) => dispatch(setSettingsPageFontSize(e.value))}
              locale="fr-FR"
            />
          </div>
        </div>
      </>
    )
  }

  const renderMargins = () => {
    return (
      <>
        <div className="lumi-doc-editor-page-row-title">
          Page margins [mm]
        </div>
        <div className="lumi-doc-editor-page-row p-inputgroup w-full">
          <span className="p-inputgroup-addon">
              <i className="pi pi-arrow-up"></i>
          </span>
          <InputNumber
            className="lumi-doc-editor-page-input"
            placeholder="Top"
            value={marginTop}
            onChange={(e) => dispatch(setSettingsPageMarginTop(e.value))}
            locale="fr-FR"
          />
          <span className="p-inputgroup-addon">
              <i className="pi pi-arrow-down"></i>
          </span>
          <InputNumber
            className="lumi-doc-editor-page-input"
            placeholder="Bottom"
            value={marginBottom}
            onChange={(e) => dispatch(setSettingsPageMarginBottom(e.value))}
            locale="fr-FR"
          />
        </div>
        <div className="lumi-doc-editor-page-row p-inputgroup w-full">
          <span className="p-inputgroup-addon">
              <i className="pi pi-arrow-left"></i>
          </span>
          <InputNumber
            className="lumi-doc-editor-page-input"
            placeholder="Left"
            value={marginLeft}
            onChange={(e) => dispatch(setSettingsPageMarginLeft(e.value))}
            locale="fr-FR"
          />
          <span className="p-inputgroup-addon">
              <i className="pi pi-arrow-right"></i>
          </span>
          <InputNumber
            className="lumi-doc-editor-page-input"
            placeholder="Right"
            value={marginRight}
            onChange={(e) => dispatch(setSettingsPageMarginRight(e.value))}
            locale="fr-FR"
          />
        </div>
      </>
    );
  }

  const renderBorder = () => {
    const renderBorderProps = () => {
      return (
        <div className="p-inputgroup">
          <span className="lumi-doc-editor-page-label p-inputgroup-addon">
            Width [px]
          </span>
          <InputNumber
            className="lumi-doc-editor-page-input borderWidth"
            placeholder="..."
            value={borderWidth}
            onChange={(e) => dispatch(setSettingsPageBorderWidth(e.value))}
            style={{maxWidth: '5rem'}}
            locale="fr-FR"
          />
          <span className="lumi-doc-editor-page-label p-inputgroup-addon">
            Color
          </span>
          <div className="lumi-doc-editor-page-border-color p-component">
            <div
              className="lumi-doc-editor-page-border-color-inner"
              style={{ backgroundColor: borderColor }}
              onClick={(e) => {
                borderColorRef.current.toggle(e);
              }}
            />
            <OverlayPanel ref={borderColorRef}>
              <ColorPicker
                color={borderColor}
                onChange={(e) => dispatch(setSettingsPageBorderColor(e.hex))}
                theme={themes.dark}
                presets={predefinedColors}
              />
            </OverlayPanel>
          </div>
        </div>
      )
    }
    return (
      <div style={{ display: "flex" }}>
        <div className="lumi-doc-editor-page-border-box">
          <Checkbox
            checked={borderStyle !== "none"}
            onChange={(e) =>
              dispatch(setSettingsPageBorderStyle(
                borderStyle !== "none" ? "none" : "solid"
              ))
            }
          />
          <span>Border</span>
        </div>
        {borderStyle !== "none" ? renderBorderProps() : <></>}
      </div>
    );
  }

  return (
    <div className='lumi-doc-editor-page-root'>
      <div className="lumi-doc-editor-page-button-bar">
        <div className="lumi-doc-editor-page-button-bar-left">
        {renderMainSettings()}
        </div>
        <div className="lumi-doc-editor-page-button-bar-right">
          <Button 
            label="Apply settings"
            onClick={() => dispatch(updateDocSettings(iframeRef))}
          />
        </div>
      </div>
      {renderMargins()}
      {renderBorder()}
      <hr className="lumi-doc-editor-page-separator"/>
    </div>
  )
}

export default PageTab
