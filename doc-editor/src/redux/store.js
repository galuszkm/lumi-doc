import { configureStore } from '@reduxjs/toolkit'
import treeReducer from './tree'
import editorReducer from './editor';
import sessionReducer from './session';
import documentReducer from './document'

export default configureStore({
  reducer: {
    tree: treeReducer,
    editor: editorReducer,
    session: sessionReducer,
    document: documentReducer
  },
  middleware: (getDefaultMiddleware) =>  
    getDefaultMiddleware({thunk: {}}),
});