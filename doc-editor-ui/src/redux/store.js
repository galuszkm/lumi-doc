import { configureStore } from '@reduxjs/toolkit'
import treeReducer from './tree'
import editorReducer from './editor';
import sessionReducer from './session';

export default configureStore({
  reducer: {
    tree: treeReducer,
    editor: editorReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>  
    getDefaultMiddleware({thunk: {}}),
});