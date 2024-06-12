import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  getDocumentURL, checkUrlExists, checkUploadResourceURL, 
  getResources, getFreeSpace, getSessionConfigFile,
} from "../utils/communicate";

const initialState = {
  id: null,
  valid: true,
  requestURL: null,
  docURL: null,
  uploadAllowed: false,
  freeSpace: 0,
  config: {
    resourceFileSizeLimit: 5*1024*1024,
    totalSizeLimit: 0,
  },
  resources: []
};

// Thunk to check if the session document URL is valid
export const validateSession = createAsyncThunk(
  'session/validateSession',
  async ({requestURL, sessionID}, { getState }) => {
    const docURL = getDocumentURL(requestURL, sessionID);
    const exists = await checkUrlExists(docURL);
    return { sessionID, requestURL, docURL, exists };
  }
);
// Thunk to check if the backend responses to resource upload
export const checkUpload = createAsyncThunk(
  'session/checkUpload',
  async ({requestURL}, { getState }) => {
    return await checkUploadResourceURL(requestURL);
  }
);
// Thunk to set session's resource files
export const getSessionResources = createAsyncThunk(
  'session/getSessionResources',
  async ({requestURL, sessionID}, { getState }) => {
    if (sessionID){
      const resources = await getResources(requestURL, sessionID);
      const freeSpace = await getFreeSpace(requestURL, sessionID);
      return {resources, freeSpace}
    } else {
      return {resources: [], freeSpace: 0}
    }
  }
);
// Thunk to set session's configuration
export const getSessionConfig = createAsyncThunk(
  'session/getSessionConfig',
  async ({requestURL, sessionID}, { getState }) => {
    if (sessionID){
      return await getSessionConfigFile(requestURL, sessionID);
    } else {
      return {}
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(validateSession.fulfilled, (state, action) => {
        state.id = action.payload.sessionID;
        state.docURL = action.payload.exists ? action.payload.docURL : null;
        state.requestURL = action.payload.exists ? action.payload.requestURL : null;
        state.valid = action.payload.exists;
      })
      .addCase(validateSession.rejected, (state, action) => {
        state.id = action.meta.arg.sessionID;
        state.docURL = null;
        state.requestURL = null;
        state.valid = false;
      })
      .addCase(checkUpload.fulfilled, (state, action) => {
        state.uploadAllowed = action.payload;
      })
      .addCase(getSessionResources.fulfilled, (state, action) => {
        state.resources = action.payload.resources;
        state.freeSpace = action.payload.freeSpace;
      })
      .addCase(getSessionConfig.fulfilled, (state, action) => {
        state.config = {...state.config, ...action.payload};
      })
  },
});
  
export default sessionSlice.reducer;

export const { setSessionID } = sessionSlice.actions;

// ===========================================================
// Selectors

export const selectSessionID = (state) => state.session.id;
export const selectIsValidSession = (state) => state.session.valid;
export const selectSessionDocURL = (state) => state.session.docURL;
export const selectSessionRequestURL = (state) => state.session.requestURL;
export const selectSessionUploadAllowed = (state) => state.session.uploadAllowed;
export const selectSessionResources = (state) => state.session.resources;
export const selectSessionFreeSpace = (state) => state.session.freeSpace;
export const selectSessionConfig = (state) => state.session.config;

// ===========================================================
// Middlewares



