import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Button } from "primereact/button";
import { 
  selectSessionID, 
  selectSessionRequestURL, 
  selectSessionUploadAllowed 
} from "../../redux/session";
import { selectNodes } from "../../redux/tree"
import { selectDocument } from "../../redux/document";
import { node2Item } from "../../utils/tree";
import { uploadDocConfigRequest } from "../../utils/communicate";
import "./OptionsTab.css";

function OptionsTab() {
  // Redux hooks
  const dispatch = useDispatch();
  const requestURL = useSelector(selectSessionRequestURL);
  const sessionID = useSelector(selectSessionID);
  const uploadAllowed = useSelector(selectSessionUploadAllowed);
  const nodes = useSelector(selectNodes);
  const docProps = useSelector(selectDocument);

  // Refs
  const toast = useRef(null);

  const handleSaveDocument = () => {
    const items = nodes.map(i => node2Item(i));
    const config = {...docProps, items:items};
    uploadDocConfigRequest(requestURL, sessionID, config)
    .then((response) => {
      if (!response.ok) {
        toast.current.show({
          severity: "error",
          summary: "Upload error",
          detail: `Failed to save document`,
          life: 2000,
        });
        return {}
      }
      return response.json();
    })
    .then((json) => {
      // Show success message
      if (json.message){
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: json.message,
          life: 2000,
        });
      }
    })
    .catch((error) => {
      toast.current.show({
        severity: "error",
        summary: "Request error",
        detail: "Error occured! See console logs.",
        life: 2000,
      });
      console.error('There was a problem with the fetch operation:', error);
    });
  }

  const renderSaveDocument = () => {
    const renderSessionLabel = () => {
      return (
        <>
        <span>Current session:</span>
        <span>{sessionID}</span>
        </>
      )
    }
    return (
      <div className="lumi-doc-editor-options-row">
        <Button
          className="lumi-doc-editor-options-row-button"
          type="button"
          icon="pi pi-save"
          label="Save document"
          disabled={!uploadAllowed}
          // tooltip="Save current document state in session" 
          // tooltipOptions={{ showDelay: 500, hideDelay: 50, position: "top", showOnDisabled: true }}
          onClick={handleSaveDocument}
        />
        <div className={"lumi-doc-editor-options-row-label" + (!uploadAllowed ? " error" : "")}>
          {uploadAllowed ? renderSessionLabel() : "Server-side session is required!"}
        </div>
      </div>
    )
  }

  return (
    <div className='lumi-doc-editor-options-root'>
      <ConfirmDialog />
      <Toast ref={toast}/>
      {renderSaveDocument()}
    </div>
  )
}

export default OptionsTab
