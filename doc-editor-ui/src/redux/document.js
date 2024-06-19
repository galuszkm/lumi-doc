import { createSlice } from "@reduxjs/toolkit";
import { convertToMM, convertToPT, convertToPX } from "../utils/functions";
import { sendSettingsToDoc, sendHeaderToDoc, sendFooterToDoc } from "../utils/communicate";

const initialState = {
  meta: {},
  header: {},
  footer: {},
  settings: {
    page: {
      width: 210,
      fontSize: 8,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000000"
    }
  },
};

const documentSlice = createSlice({
  name: "document",
  initialState: initialState,
  reducers: {
    setDocument: (state, action) => {
      state.meta = action.payload.meta ?? {...state.meta, ...action.payload.meta};
      state.header = action.payload.header ?? {...state.header, ...action.payload.header};
      state.footer = action.payload.footer ?? {...state.footer, ...action.payload.footer};
      // Parse adn set settings
      const settings = action.payload.settings;
      settings.page = settings.page ? parseSettingsPage(settings.page) : initialState.settings.page;
      state.settings = action.payload.settings ?? {...state.settings, ...settings};
    },
    setMeta: (state, action) => {
      state.meta = action.payload;
    },
    setHeader: (state, action) => {
      state.header = action.payload;
    },
    setFooter: (state, action) => {
      state.footer = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = {...action.payload.settings, ...action.payload};
    },
    setSettingsPageWidth: (state, action) => {
      state.settings.page.width = action.payload;
    },
    setSettingsPageFontSize: (state, action) => {
      state.settings.page.fontSize = action.payload;
    },
    setSettingsPageMarginLeft: (state, action) => {
      state.settings.page.marginLeft = action.payload;
    },
    setSettingsPageMarginRight: (state, action) => {
      state.settings.page.marginRight = action.payload;
    },
    setSettingsPageMarginTop: (state, action) => {
      state.settings.page.marginTop = action.payload;
    },
    setSettingsPageMarginBottom: (state, action) => {
      state.settings.page.marginBottom = action.payload;
    },
    setSettingsPageBorderStyle: (state, action) => {
      state.settings.page.borderStyle = action.payload;
    },
    setSettingsPageBorderWidth: (state, action) => {
      state.settings.page.borderWidth = action.payload;
    },
    setSettingsPageBorderColor: (state, action) => {
      state.settings.page.borderColor = action.payload;
    },
  },
});

export default documentSlice.reducer;

export const {
  setDocument,
  setMeta,
  setHeader,
  setFooter,
  setSettings,
  setSettingsPageWidth,
  setSettingsPageFontSize,
  setSettingsPageMarginLeft,
  setSettingsPageMarginRight,
  setSettingsPageMarginTop,
  setSettingsPageMarginBottom,
  setSettingsPageBorderStyle,
  setSettingsPageBorderWidth,
  setSettingsPageBorderColor,
} = documentSlice.actions;

// ===========================================================
// Selectors

export const selectDocument = (state) => state.document;
export const selectMeta = (state) => state.document.meta;
export const selectHeader = (state) => state.document.header;
export const selectFooter = (state) => state.document.footer;
export const selectSettings = (state) => state.document.settings;
export const selectSettingsPage = (state) => state.document.settings.page;

// ===========================================================
// Communication with document iframe

export const updateDocSettings = (iframeRef) => (dispatch, getState) => {
  const state = getState();
  const page = parseSettingsPageWithUnits(state.document.settings.page);
  sendSettingsToDoc(iframeRef, {...state.document.settings, page:page});
};

export const updateDocHeader = (iframeRef) => (dispatch, getState) => {
  const state = getState();
  sendHeaderToDoc(iframeRef, state.document.header);
};

export const updateDocFooter = (iframeRef) => (dispatch, getState) => {
  const state = getState();
  sendFooterToDoc(iframeRef, state.document.footer);
};

// ===========================================================
// Middlewares

const addUnit = (value, unit) => value ? `${value}${unit}` : undefined;

const parseSettingsPage = (props) => {
  const __default__ = initialState.settings.page;
  return {
    ...props,
    width : convertToMM(props.width) || __default__.width,
    fontSize: convertToPT(props.fontSize) || __default__.fontSize,
    marginLeft: convertToMM(props.marginLeft) || __default__.marginLeft,
    marginRight: convertToMM(props.marginRight) || __default__.marginRight,
    marginTop: convertToMM(props.marginTop) || __default__.marginTop,
    marginBottom: convertToMM(props.marginBottom ) || __default__.marginBottom,
    borderStyle: props.borderStyle || __default__.borderStyle,
    borderWidth: convertToPX(props.borderWidth) || __default__.borderWidth,
    borderColor: props.borderColor || __default__.borderColor,
  }
}

const parseSettingsPageWithUnits = (props) => {
  return {  
    ...props,
    width : addUnit(props.width, 'mm'),
    fontSize: addUnit(props.fontSize, 'pt'),
    marginLeft: addUnit(props.marginLeft, 'mm'),
    marginRight: addUnit(props.marginRight, 'mm'),
    marginTop: addUnit(props.marginTop, 'mm'),
    marginBottom: addUnit(props.marginBottom, 'mm'),
    borderWidth: addUnit(props.borderWidth, 'px'),
  }
}