import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useDropzone } from 'react-dropzone';

import { setOriginalFile } from '../secureFileSlice';
import { useTheme } from "@material-ui/core";

const baseDropzoneStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderStyle: 'dashed',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const activeDropzoneStyle = {
  borderColor: '#2196f3'
};

const acceptDropzoneStyle = {
  borderColor: '#00e676'
};

const rejectDropzoneStyle = {
  borderColor: '#ff1744'
};

const UploadFileForm = () => {
  const dispatch = useDispatch();

  const theme = useTheme();

  const dropzoneThemed = {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderColor: theme.palette.text.primary,
  };

  const [error, setError] = useState(null);

  const dropzoneOptions = {
    maxFiles: 1,
    multiple: false,
    onDragEnter: useCallback(() => {
      setError(null);
    }, []),
    onDropAccepted: useCallback((acceptedFiles) => {
      dispatch(setOriginalFile(acceptedFiles[0]));
    }, [dispatch]),
    onDropRejected: useCallback((rejectedFiles) => {
      console.error('files rejected', rejectedFiles);
      setError('Ce type de fichier n\'est pas géré.');
    }, []),
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone(dropzoneOptions);

  const style = useMemo(() => ({
    ...baseDropzoneStyle,
    ...dropzoneThemed,
    ...(isDragActive ? activeDropzoneStyle : {}),
    ...(isDragAccept ? acceptDropzoneStyle : {}),
    ...(isDragReject ? rejectDropzoneStyle : {}),
  }), [
    dropzoneThemed,
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  return (
    <div className="container">
      <div {...getRootProps({ style, onClick: (event) => setError(null) })}>
        <input {...getInputProps()} />
        <p className="mb-0">Glissez et déposez un fichier ici, ou cliquez pour le sélectionner.</p>
        {
          (error)
            ? <p className="mb-0 text-danger">{error}</p>
            : <></>
        }
      </div>
    </div>
  );
};

export default UploadFileForm;
