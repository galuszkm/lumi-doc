import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  meta: {},
  header: {},
  footer: {},
  settings: {},
};

const documentSlice = createSlice({
  name: "document",
  initialState: initialState,
  reducers: {
    setDocument: (state, action) => {
      state.meta = action.payload.meta ?? {...state.meta, ...action.payload.meta};
      state.header = action.payload.header ?? {...state.header, ...action.payload.header};
      state.footer = action.payload.footer ?? {...state.footer, ...action.payload.footer};
      state.settings = action.payload.settings ?? {...state.settings, ...action.payload.settings};
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
      state.settings = action.payload;
    },
  },
});

export default documentSlice.reducer;

export const { setDocument, setMeta, setHeader, setFooter, setSettings } = documentSlice.actions;

// ===========================================================
// Selectors

export const selectDocument = (state) => state.document;
export const selectMeta = (state) => state.document.meta;
export const selectHeader = (state) => state.document.header;
export const selectFooter = (state) => state.document.footer;
export const selectSettings = (state) => state.document.settings;
