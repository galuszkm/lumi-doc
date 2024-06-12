import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getSessionResources,
  selectSessionConfig,
  selectSessionFreeSpace, 
  selectSessionID, 
  selectSessionRequestURL, 
  selectSessionResources, 
  selectSessionUploadAllowed 
} from "../redux/session";
import { getUploadResourceURL } from '../utils/communicate';
import { formatSize } from '../utils/functions';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import "./ResourcesTab.css"

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

  const uploadHandler = (e) => {
    const files = handleCheckFileSize(e.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1]; // Remove the data URL prefix
        fetch(`${requestURL}/uploadResource`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',},
          body: JSON.stringify({
            sessionID: sessionID,
            filename: file.name,
            file: base64data,
          }),
        })
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
      } else {
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
    if (file.type === 'image'){
      return (
        <Image 
          className="lumi-doc-editor-resource-icon"
          role="presentation" 
          src={file.path}
          height='48'
          preview 
        />
      )
    } else {
      <></>
    }
  };

  const handleRemoveFile = (file) => {

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
          url={getUploadResourceURL(requestURL)}
          multiple
          accept="image/*"
          customUpload
          uploadHandler={uploadHandler}
        />
      </>
    )
  }

  const renderHeader = () => {
    const currentSize = sessionConfig.totalSizeLimit - freeSpace;
    return (
      <div className="lumi-doc-editor-resource-header">
        {renderFileUpload()}
        <div className="lumi-doc-editor-resource-sizebar-box">
          <div className="lumi-doc-editor-resource-sizebar">
            <span>{formatSize(currentSize)} / {formatSize(sessionConfig.totalSizeLimit)}</span>
            <ProgressBar
              value={currentSize/sessionConfig.totalSizeLimit}
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
        <>{sessionResources.map(i => fileTemplate(i))}</>
      </div>
    )
  }

  return (
    uploadAllowed ? renderTab() : renderError()
  );
}

export default ResourcesTab;
