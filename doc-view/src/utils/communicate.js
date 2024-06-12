import { scrollToItem } from "../utils/functions";
import { setConfig, setItems, sendConfigToEditor } from "../redux/config";

// Decorator to check if the app is running inside an iframe (Editor app)
const withIframeCheck = (fn) => {
  return (...args) => {
    if (window.parent !== window.self) {
      fn(...args);
    }
  };
};

// Send config to the parent window
export const sendConfig = withIframeCheck((config) => {
  window.parent.postMessage({ type: "sendConfig", config }, "*");
});

// Send id of clicked item to the parent window
export const sendClickedItemID = withIframeCheck((id) => {
  window.parent.postMessage({ type: "sendClickedItemID", id }, "*");
});

// Handle messages from Editor
export const setMessageHandler = (dispatch) => {
  // Listen for messages from the parent window (editor)
  const handleMessage = (event) => {
    const type = event.data.type;
    if (type === 'updateConfig') {
      dispatch(setConfig(event.data.config));
    } else if (type === 'updateItems') {
      dispatch(setItems(event.data.items));
    } else if (type === 'getConfig') {
      dispatch(sendConfigToEditor());
    } else if (type === 'scrollToItem'){
      scrollToItem(event.data.id);
    }
  };
  window.addEventListener('message', handleMessage);
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
