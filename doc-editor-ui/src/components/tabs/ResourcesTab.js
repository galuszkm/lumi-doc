import React, { useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { 
  getSessionResources,
  selectSessionConfig,
  selectSessionFreeSpace, 
  selectSessionID, 
  selectSessionRequestURL, 
  selectSessionResources, 
  selectSessionUploadAllowed 
} from "../../redux/session";
import {
  uploadResourceRequest, 
  removeResourceRequest 
} from '../../utils/communicate';
import { formatSize, getColorClass } from '../../utils/functions';
import 'primeicons/primeicons.css';
import "./ResourcesTab.css";

function ResourcesTab() {

  // Redux hooks
  const dispatch = useDispatch();
  const requestURL = useSelector(selectSessionRequestURL);
  const sessionID = useSelector(selectSessionID);
  const uploadAllowed = useSelector(selectSessionUploadAllowed);
  const freeSpace = useSelector(selectSessionFreeSpace);
  const sessionConfig = useSelector(selectSessionConfig);
  const sessionResources = useSelector(selectSessionResources);

  // Local states and refs
  const fileUploadRef = useRef(null);
  const toast = useRef(null);
  const currentResourceSize = useMemo(() => {
    return sessionConfig.totalSizeLimit - freeSpace
  }, [freeSpace, sessionConfig]);

  const uploadHandler = (e) => {
    const files = handleCheckFileSize(e.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1]; // Remove the data URL prefix
        uploadResourceRequest(requestURL, sessionID, file.name, base64data)
        .then((response) => {
          if (!response.ok) {
            toast.current.show({
              severity: "error",
              summary: "Upload error",
              detail: `Failed to upload file ${file.name}`,
              life: 2000,
            });
            return {}
          }
          return response.json();
        })
        .then((json) => {
          // Update session resources and free space
          dispatch(getSessionResources({requestURL, sessionID}));
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
      };
      reader.readAsDataURL(file);
    });
    // Clear files
    e.options.clear();
  };

  const handleCheckFileSize = (files) => {
    let space_left = freeSpace;
    const __files__ =  files.map((file, idx) => {
      if (file.size > sessionConfig.resourceFileSizeLimit){
        toast.current.show({
          severity: "error",
          summary: `File size > ${formatSize(sessionConfig.resourceFileSizeLimit)}`,
          detail: 
            `File size ${formatSize(file.size)} is too big: ${file.name}`,
          life: 2500,
        });
        return null
      } else if ((space_left-file.size) <= 0){
        toast.current.show({
          severity: "error",
          summary: `Not enough space`,
          detail: 
            `Not enough space left in session to upload file: ${file.name}`,
          life: 2500,
        });
        return null
      } else {
        // Update session space left for resources
        space_left -= file.size;
        return file
      }
    });
    return __files__.filter(i => i !== null)
  };

  const fileTemplate = (file) => {
    return (
      <div className="lumi-doc-editor-resource-box">
        {fileIconTemplate(file)}
        <div className="lumi-doc-editor-resource-file-title"><span>{file.filename}</span></div>
        <div className="lumi-doc-editor-resource-file-size">
          <span className='lumi-doc-editor-resource-file-size-label'>
            {formatSize(file.size)}
          </span>
        </div>
        <div className='lumi-doc-editor-resource-file-remove'>
          <Button
            type="button"
            icon="pi pi-times"
            className="custom-cancel-btn p-button-danger"
            onClick={() => handleRemoveFile(file)}
          />
        </div>
      </div>
    );
  };

  const fileIconTemplate= (file) => {
    const iconClass = 'lumi-doc-editor-resource-icon';
    let icon = <></>
    if (file.type === 'image'){
      return <Image 
              className="lumi-doc-editor-resource-icon"
              role="presentation" 
              src={file.path}
              zoomSrc={file.path}
              height='48'
              preview 
            />
    } 
    else if (file.type === 'pdf')   icon = <i className={`${iconClass} pi pi-file-pdf`} />
    else if (file.type === 'doc')   icon = <i className={`${iconClass} pi pi-file-word`} />
    else if (file.type === 'docx')  icon = <i className={`${iconClass} pi pi-file-word`} />
    else if (file.type === 'xls')   icon = <i className={`${iconClass} pi pi-file-excel`} />
    else if (file.type === 'xlsx')  icon = <i className={`${iconClass} pi pi-file-excel`} />
    else if (file.type === 'zip')   icon = <i className={`${iconClass} pi pi-folder`} />
    else if (file.type === 'js')    icon = <i className={`${iconClass} pi pi-code`} />
    else if (file.type === 'json')  icon = <i className={`${iconClass} pi pi-code`} />
    else if (file.type === 'video') icon = <i className={`${iconClass} pi pi-video`} />
    else                            icon = <i className={`${iconClass} pi pi-file`} />
    return icon
  };

  const handleRemoveFile = (file) => {
    // Accept file remove
    const accept = () => {
      removeResourceRequest(requestURL, sessionID, file.filename)
      .then((response) => {
        if (!response.ok) {
          toast.current.show({
            severity: "error",
            summary: "Remove error",
            detail: `Failed to remove file ${file.filename}`,
            life: 2000,
          });
          return {}
        }
        return response.json();
      })
      .then((json) => {
        // Update session resources and free space
        dispatch(getSessionResources({requestURL, sessionID}));
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

    // Reject file remove
    const reject = () => {}
    
    // Toogle confirm dialog
    confirmDialog({
      message: `Do you want to delete file ${file.filename}?`,
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept,
      reject,
    });
  };

  const renderFileUpload = () => {
    return (
      <>
        <Toast ref={toast}/>
        <FileUpload
          ref={fileUploadRef}
          mode='basic'
          auto
          name="doc-editor-upload-file"
          className='lumi-doc-editor-resource-fileupload'
          multiple
          customUpload
          uploadHandler={uploadHandler}
        />
      </>
    )
  }

  const renderHeader = () => {
    return (
      <div className="lumi-doc-editor-resource-header">
        {renderFileUpload()}
        <div className="lumi-doc-editor-resource-sizebar-box">
          <div className="lumi-doc-editor-resource-sizebar">
            <span>{formatSize(currentResourceSize)} / {formatSize(sessionConfig.totalSizeLimit)}</span>
            <ProgressBar
              className={
                `lumi-doc-editor-resource-progress-bar 
                ${getColorClass(100*currentResourceSize/sessionConfig.totalSizeLimit)}
              `}
              value={100*currentResourceSize/sessionConfig.totalSizeLimit}
              showValue={false}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div className='lumi-doc-editor-resource-error'>
        <h4>
          Resource upload not avaliable! <br />
          Server-side resource handler is required
        </h4>
      </div>
    )
  }

  const renderTab = () => {
    return (
      <div className='lumi-doc-editor-resource-root'>
        {renderHeader()}
        <ConfirmDialog />
        <>{sessionResources.map(i => fileTemplate(i))}</>
      </div>
    )
  }

  return (
    uploadAllowed ? renderTab() : renderError()
  );
}

export default ResourcesTab;
