import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Backdrop, CircularProgress, makeStyles, Toolbar, Typography } from "@material-ui/core";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import FileManager from "../../features/FileManager/components/file-manager";
import { hideFile, setAction } from "../../features/FileManager/file-manager-slice";
import FileViewer from "../../features/FileViewer/components/file-viewer";
import { decryptedFile, fetchDocumentsOriginals } from "../../features/contracts/savDocContractSlice";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.tooltip + 1,
  },
}));

const DocumentsViewer = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const history = useHistory();

  const [file, setFile] = useState(null);
  const savDocContract = useSelector(state => state.savDocContract.contract);
  const fetchDocumentsOriginalsState = useSelector(state => state.savDocContract.fetchDocumentsOriginalsState);
  const decryptedFiles = useSelector(state => state.savDocContract.decryptedFiles);
  const fileManagerAction = useSelector(state => state.fileManager.action);
  const fileToShow = useSelector(state => state.fileManager.fileToShow);

  useEffect(() => {
    if (savDocContract) {
      dispatch(fetchDocumentsOriginals());
    }
  }, [dispatch, savDocContract]);

  useEffect(() => {
    if (fileManagerAction) {
      switch (fileManagerAction) {
        case 'addFile':
          history.push('/documents/secure');
          dispatch(setAction(null));
          break;

        default:
          break;
      }
    } else {
      setFile(null);
    }
  }, [dispatch, history, fileManagerAction]);

  useEffect(() => {
    if (fileToShow) {
      dispatch(decryptedFile(fileToShow.data));
    } else {
      setFile(null);
    }
  }, [dispatch, fileToShow]);

  useEffect(() => {
    if (fileToShow && decryptedFiles && decryptedFiles[fileToShow.data.tokenID]) {
      setFile(decryptedFiles[fileToShow.data.tokenID].data);
    }
  }, [dispatch, fileToShow, decryptedFiles]);

  const handleClose = () => {
    dispatch(hideFile());
  };

  return (
    <>
      <AppBar color="default" position="sticky">
        <Toolbar>
          <Typography display="inline" variant="h6" className={classes.title}>SAV-Doc</Typography>
          <ToggleThemeModeButton />
        </Toolbar>
      </AppBar>

      <main>
        <FileManager fileMap={fetchDocumentsOriginalsState.fileMap} />

        <Backdrop className={classes.backdrop} open={!!fileToShow} onClick={handleClose}>
          {
            (file)
              ? (
                <div onClick={(event) => event.stopPropagation()}>
                  <FileViewer file={file} />
                </div>
              )
              : (
                <CircularProgress color="inherit" />
              )
          }

        </Backdrop>
      </main>
    </>
  );
};

export default DocumentsViewer;
