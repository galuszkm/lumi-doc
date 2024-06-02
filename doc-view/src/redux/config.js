import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from 'reselect';
import { sendConfig } from "../utils/communicate";

const initialState = {
  meta: {},
  settings: {
    page: {
      width: "210mm",
      fontSize: "8pt",
      marginTop: "1cm",
      marginBottom: "1cm",
      marginLeft: "1cm",
      marginRight: "1cm",
      border: "1px solid black"
    },
    table:{
      title: {
        fontSize: "8pt"
      },
      headerCell:{
        paddingTop: "6px",
        paddingBottom: "6px",
        textAlign: "center",
        verticalAlign: "middle",
      },
      bodyCell:{
        paddingTop: "5px",
        paddingBottom: "5px",
        textAlign: "center",
        verticalAlign: "middle",
      }
    },
    image:{
      title: {
        fontSize: "8pt"
      }
    },
    chart:{
      title: {
        fontSize: "8pt"
      }
    }
  },
  header: {
    type: null,
  },
  footer :{
    type: null,
  },
  items: [],
};

const configSlice = createSlice({
  name: "config",
  initialState: initialState,
  reducers: {
    setConfig: (state, action) => {
      state.meta = {...initialState.meta, ...(action.payload?.meta ?? {})};
      state.settings = {...initialState.settings, ...(action.payload?.settings ?? {})};
      state.header = {...initialState.header, ...(action.payload?.header ?? {})};
      state.items = [...initialState.items, ...(action.payload?.items ?? [])];
      state.footer = {...initialState.footer, ...(action.payload?.footer ?? {})};
    },
    setItems: (state, action) => {
      state.items = action.payload;
    }
  },
});

export default configSlice.reducer;

export const { setConfig, setItems } = configSlice.actions;

// ===========================================================
// Selectors

export const selectConfig = state => state.config;
export const selectItemType = (state, itemType) => itemType;
export const selectItemId = (state, itemType, itemId) => itemId;

export const selectItemsByType = createSelector(
  [selectConfig, selectItemType],
  (config, itemType) => 
    // Get all items of specified type
    // Skip the items that has showTitle=false
    filterByType(config, itemType).filter(i => i.showTitle ?? true)
);

export const selectItemIndex = createSelector(
  [selectItemsByType, selectItemId],
  (items, itemId) => {
    // Find the index of the item with the specified ID
    // Skip the items that has showTitle=false
    const itemIndex = items
      .filter(i => i.showTitle ?? true)
      .findIndex(item => item.id === itemId);
    // Return the index (if found) + 1, else return -1 to indicate not found
    return itemIndex !== -1 ? itemIndex + 1 : itemIndex;
  }
);
export const selectSettings = state => state.config.settings;
export const selectHeader = state => state.config.header;
export const selectItems = state => state.config.items;
export const selectFooter = state => state.config.footer;


// ===========================================================
// Middlewares

const filterByType = (obj, targetType) => {
  if (obj.type === targetType) {
    return [obj];
  }
  let result = [];
  if (Array.isArray(obj.items)) {
    for (const item of obj.items) {
      result = result.concat(filterByType(item, targetType));
    }
  }
  return result;
}

export const sendConfigToEditor = () => (dispatch, getState) => {
  const state = getState();
  sendConfig(state.config);
};
