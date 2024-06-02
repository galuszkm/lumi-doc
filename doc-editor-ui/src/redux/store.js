import { configureStore } from '@reduxjs/toolkit'
import treeReducer from './tree'
import editorReducer from './editor';

export default configureStore({
  reducer: {
    tree: treeReducer,
    editor: editorReducer,
  },
  middleware: (getDefaultMiddleware) =>  
    getDefaultMiddleware({thunk: {}}),
});