import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputText } from 'primereact/inputtext';
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from "primereact/dropdown";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { ColorPicker, themes } from 'react-pick-color';
import { 
  selectSettingsPage,
  selectHeader, setHeaderType,
  selectFooter,
  setHeaderTitleText, setHeaderTitleStyle, resetHeaderTitleStyle,
  setSettingsPageWidth, setSettingsPageFontSize,
  setSettingsPageMarginTop, setSettingsPageMarginBottom,
  setSettingsPageMarginLeft, setSettingsPageMarginRight,
  setSettingsPageBorderStyle, setSettingsPageBorderWidth, setSettingsPageBorderColor,
  updateDocSettings, updateDocHeader,
} from "../../redux/document";
import { setEditorItem, setEditorOpen } from "../../redux/editor";
import { useRefContext } from "../../hooks/RefContext";
import icons from '../../icons/icons_quill';
import "./PageTab.css";

const predefinedColors = [
  '#000000', '#e60000', '#ff9900', '#ffff00', 
  '#008a00', '#0066cc', '#9933ff', '#ffffff'
];
const tooltipOptions = { showDelay: 500, position: 'top' };

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
  const borderColorRef = useRef(null);
  const textColorRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Other
  const headerTypeOptions = [
    { label: 'none', value: 'none' },
    { label: 'title', value: 'title' },
    { label: 'table', value: 'table' },
  ];

  const handleChangeBorderColor = (color) => {
    const colorHex = color.hex;
    const updateColor = () => {
      dispatch(setSettingsPageBorderColor(colorHex));
      dispatch(updateDocSettings(iframeRef));
    };
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(updateColor, 500);
  };

  const handleChangeTitleColor = (color) => {
    const colorHex = color.hex;
    const updateColor = () => {
      const style = { color: colorHex };
      dispatch(setHeaderTitleStyle(style));
      dispatch(updateDocHeader(iframeRef));
    };
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(updateColor, 500);
  };

  const handleChangeTitleTextAlign = (alignment) => {
    const style = { textAlign: alignment };
    dispatch(setHeaderTitleStyle(style));
    dispatch(updateDocHeader(iframeRef));
  };

  const handleTitleClearFormatting = () => {
    dispatch(resetHeaderTitleStyle());
    dispatch(updateDocHeader(iframeRef));
  };

  const renderGeneralSettings = () => {
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
                onChange={handleChangeBorderColor}
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
            onChange={(e) => {
              dispatch(setSettingsPageBorderStyle(borderStyle !== "none" ? "none" : "solid"));
              dispatch(updateDocSettings(iframeRef));
            }
            }
          />
          <span>Border</span>
        </div>
        {borderStyle !== "none" ? renderBorderProps() : <></>}
      </div>
    );
  }

  const renderHeader = () => {
    const renderInnner = () => {
      if (header.type === "title") {
        return renderHeaderTitle()
      } else if (header.type === "table"){
        return (
          <Button
            className="header-table"
            label="Edit table"
            onClick={() => {
              // Open header table editor
              dispatch(setEditorItem({ type: "Header Table" }));
              dispatch(setEditorOpen(true));
            }}
          />
        );
      } else {
        return <></>
      }
    }
    return (
      <>
        <div className="lumi-doc-editor-page-row-title">
          Header
        </div>
        <div className="lumi-doc-editor-page-row inline">
          <div className="lumi-doc-editor-page-row page-header p-inputgroup">
            <span className="p-inputgroup-addon">
                Type
            </span>
            <Dropdown
              className="lumi-doc-editor-page-dropdown header-type"
              options={headerTypeOptions}
              value={header.type}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => {
                dispatch(setHeaderType(e.value));
                dispatch(updateDocHeader(iframeRef));
              }}
            />
            {renderInnner()}
          </div>
        </div>
      </>
    );
  }

  const renderHeaderTitle = () => {
    return (
      <>
        <InputText
          className="lumi-doc-editor-page-input"
          placeholder="Header ..."
          value={header.title.text}
          onChange={(e) => dispatch(setHeaderTitleText(e.target.value))}
        />
        <Button
          className="text-color"
          onClick={(e) => {
            textColorRef.current.toggle(e);
          }}
          tooltip="Color text"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.color }} />
        </Button>
        <OverlayPanel ref={textColorRef}>
          <ColorPicker
            color={header.title.style.color}
            onChange={handleChangeTitleColor}
            theme={themes.dark}
            presets={predefinedColors}
          />
        </OverlayPanel>
        <Button
          className={`align-left ${header.title.style.textAlign === 'left' ? 'active' : ''}`}
          onClick={() => handleChangeTitleTextAlign("left")}
          tooltip="Align left"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.alignLeft }} />
        </Button>
        <Button
          className={`align-center ${header.title.style.textAlign === 'center' ? 'active' : ''}`}
          onClick={() => handleChangeTitleTextAlign("center")}
          tooltip="Align center"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.alignCenter }} />
        </Button>
        <Button
          className={`align-right ${header.title.style.textAlign === 'right' ? 'active' : ''}`}
          onClick={() => handleChangeTitleTextAlign("right")}
          tooltip="Align right"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.alignRight }} />
        </Button>
        <Button
          className="clear"
          onClick={handleTitleClearFormatting}
          tooltip="Clear styling"
          tooltipOptions={tooltipOptions}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.clean }} />
        </Button>
      </>
    )
  }

  return (
    <div className='lumi-doc-editor-page-root'>
      <div className="lumi-doc-editor-page-button-bar">
        <div className="lumi-doc-editor-page-button-bar-left">
        {renderGeneralSettings()}
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
      {renderHeader()}
    </div>
  )
}

export default PageTab
