import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  item: {},
  open: false,
};

const editorSlice = createSlice({
  name: "editor",
  initialState: initialState,
  reducers: {
    setEditorItem: (state, action) => {
      state.item = action.payload;
    },
    setEditorOpen: (state, action) => {
      state.open = action.payload;
    },
  },
});

export default editorSlice.reducer;

export const { setEditorItem, setEditorOpen } = editorSlice.actions;

// ===========================================================
// Selectors

export const selectEditorItemId = (state) => state.editor.item?.id;
export const selectEditorItemType = (state) => state.editor.item?.type;
export const selectEditorItem = (state) => state.editor.item;
export const selectEditorOpen = (state) => state.editor.open;
