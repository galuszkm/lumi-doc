import { item2Node, node2Item } from "./tree";
import { setNodes } from "../redux/tree";
import { setDocument } from "../redux/document";

// Check if url responses
export const checkUrlExists = async (url) => {
  const response = await fetch(url, { method: 'HEAD' });
  return response.ok
}

// ============================================================
// Communication with backend - via Web API HTTP request

// Get document URL
export const getDocumentURL = (requestURL, sessionID) => {
  // If session ID not provided (development) - assume document is served on request URL
  return sessionID ? `${requestURL}/getSession?sessionID=${sessionID}` : requestURL
}
// Get URL to upload resource file
export const getUploadResourceURL = (requestURL) => {
  return `${requestURL}/uploadResource`
}
// Check upload resource file URL respond
export const checkUploadResourceURL = async (requestURL) => {
  const url = getUploadResourceURL(requestURL);
  try {
    const res = await fetch(url).then(i => i.json()).then(i => i.status);
    return res 
  } catch {
    return false
  }
}
// Send POST request to upload resource file
export const uploadResourceRequest = (requestURL, sessionID, filename, base64data) =>{
  return fetch(`${requestURL}/uploadResource`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',},
    body: JSON.stringify({
      sessionID: sessionID,
      filename: filename,
      file: base64data,
    }),
  })
}
// Send POST request to upload resource file
export const removeResourceRequest = (requestURL, sessionID, filename) =>{
  return fetch(`${requestURL}/removeResource`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json',},
    body: JSON.stringify({
      sessionID: sessionID,
      filename: filename,
    }),
  })
}
// Get resource files
export const getResources = async (requestURL, sessionID) => {
  const url = `${requestURL}/getResources?sessionID=${sessionID}`
  const files = await fetch(url, { method: 'GET' }).then(response => response.json());
  return files.resources ? files.resources : []
}
// Get remaining free space for current session
export const getFreeSpace = async (requestURL, sessionID) => {
  const url = `${requestURL}/getSessionFreeSpace?sessionID=${sessionID}`
  const response = await fetch(url, { method: 'GET' }).then(response => response.json());
  return response.space ? response.space : 0
}
// Get session configuration
export const getSessionConfigFile = async (requestURL, sessionID) => {
  const url = `${requestURL}/getSessionConfig?sessionID=${sessionID}`
  const config = await fetch(url, { method: 'GET' }).then(response => response.json());
  return config ? config : {}
}
// Send POST request to upload config file
export const uploadDocConfigRequest = (requestURL, sessionID, config) =>{
  return fetch(`${requestURL}/uploadDocConfig`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',},
    body: JSON.stringify({
      sessionID: sessionID,
      config: config,
    }),
  })
}
// Send GET request to donwload document file
export const downloadDocument = (requestURL, sessionID) =>{
  const url = `${requestURL}/downloadSessionDoc?sessionID=${sessionID}`
  open(url, '_blank')
}

// ============================================================
// Communication with document app - via iframe postMessage()

// Request the config from document
export const getConfig = (iframeRef) => {
  if (iframeRef.current) {
    iframeRef.current.contentWindow.postMessage({ type: "getConfig" }, "*");
  }
};
// Send config settings to document
export const sendSettingsToDoc = (iframeRef, settings) => {
  iframeRef.current.contentWindow.postMessage({ type:'updateSettings', settings:settings}, '*');
}
// Send config header to document
export const sendHeaderToDoc = (iframeRef, header) => {
  iframeRef.current.contentWindow.postMessage({ type:'updateHeader', header:header}, '*');
}
// Send config footer to document
export const sendFooterToDoc = (iframeRef, footer) => {
  iframeRef.current.contentWindow.postMessage({ type:'updateItems', footer:footer}, '*');
}
// Send config items to document
export const sendItemsToDoc = (iframeRef, nodes) => {
  const items = nodes.map(i => node2Item(i));
  iframeRef.current.contentWindow.postMessage({ type:'updateItems', items: items}, '*');
}
// Request document to scroll to item with given id
export const scrollToItem = (iframeRef, id) => {
  iframeRef.current.contentWindow.postMessage({ type:'scrollToItem', id: id}, '*');
}
// Message receive handler
export const setMessageHandler = (dispatch) => {
  const handleMessage = (event) => {
    if (event.data.type === "sendConfig" && event.data.config) {
      if (event.data.config) {
        const {items, ...rest} = event.data.config;
        const nodes = items.map(i => item2Node(i));
        dispatch(setNodes(nodes));
        dispatch(setDocument(rest));
      }
    }
  };
  window.addEventListener("message", handleMessage);
  return () => {
    window.removeEventListener("message", handleMessage);
  };
}