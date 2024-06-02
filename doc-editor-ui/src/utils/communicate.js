import { item2Node, node2Item } from "./tree";
import { setNodes } from "../redux/tree";

export const getConfig = (iframeRef) => {
  if (iframeRef.current) {
    iframeRef.current.contentWindow.postMessage({ type: "getConfig" }, "*");
  }
};

export const sendItemsToDoc = (iframeRef, nodes) => {
  const items = nodes.map(i => node2Item(i));
  iframeRef.current.contentWindow.postMessage({ type:'updateItems',  items: items}, '*');
}

export const scrollToItem = (iframeRef, id) => {
  iframeRef.current.contentWindow.postMessage({ type:'scrollToItem', id: id}, '*');
}

export const setMessageHandler = (dispatch) => {
  const handleMessage = (event) => {
    if (event.data.type === "sendConfig") {
      if (event.data.config) {
        const __config__ = event.data.config;
        const __nodes__ = __config__.items.map(i => item2Node(i));
        dispatch(setNodes(__nodes__));
      }
    }
  };
  window.addEventListener("message", handleMessage);
  return () => {
    window.removeEventListener("message", handleMessage);
  };
}