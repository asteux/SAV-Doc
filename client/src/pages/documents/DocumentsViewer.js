import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Backdrop, CircularProgress, Drawer, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography } from "@material-ui/core";
import FolderIcon from '@material-ui/icons/Folder';
import { useHistory } from "react-router";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import FileManager from "../../features/FileManager/components/file-manager";
import { deleteFile, hideFile, setAction } from "../../features/FileManager/file-manager-slice";
import FileViewer from "../../features/FileViewer/components/file-viewer";
import { decryptFile, deleteDocument, deleteSharedDocument, fetchDocumentsOriginals, fetchDocumentsShared } from "../../features/contracts/savDocContractSlice";
import SendDocumentDialog from "../../features/sendDocument/SendDocumentDialog";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    flexGrow: 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.tooltip + 1,
  },
}));

const DocumentsViewer = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const history = useHistory();

  const [category, setCategory] = useState('original');
  const [file, setFile] = useState(null);
  const web3 = useSelector(state => state.web3.web3);
  const savDocContract = useSelector(state => state.savDocContract.contract);
  const fetchDocumentsOriginalsState = useSelector(state => state.savDocContract.fetchDocumentsOriginalsState);
  const fetchDocumentsSharedState = useSelector(state => state.savDocContract.fetchDocumentsSharedState);
  const decryptedFiles = useSelector(state => state.savDocContract.decryptedFiles);
  const fileManagerAction = useSelector(state => state.fileManager.action);
  const fileToShow = useSelector(state => state.fileManager.fileToShow);
  const fileToShare = useSelector(state => state.fileManager.fileToShare);
  const fileToDelete = useSelector(state => state.fileManager.fileToDelete);

  const [openSendDocumentDialog, setOpenSendDocumentDialog] = useState(false);
  const handleOpenSendDocumentDialog = (event) => setOpenSendDocumentDialog(true);
  const handleCloseSendDocumentDialog = (event) => setOpenSendDocumentDialog(false);

  const fileMap = useMemo(() => {
    switch (category) {
      case 'original':
        return fetchDocumentsOriginalsState.fileMap;

      case 'shared':
        return fetchDocumentsSharedState.fileMap;

      default:
        break;
    }
  }, [category, fetchDocumentsOriginalsState, fetchDocumentsSharedState]);

  useEffect(() => {
    const callbacks = [];
    if (savDocContract) {
      dispatch(fetchDocumentsOriginals());
      // Manage savDocContract events
      const eventSecureDocumentEmitter = savDocContract.events.SecureDocument()
        .on('data', async (event) => {
          // address user, uint256 tokenID
          const userAddress = event.returnValues.user;
          // const tokenID = parseInt(event.returnValues.tokenID);

          const accounts = await web3.eth.getAccounts();

          if (userAddress === accounts[0]) {
            dispatch(fetchDocumentsOriginals());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventSecureDocumentEmitter.removeAllListeners(); });

      const eventDeleteDocummentEmitter = savDocContract.events.DeleteDocumment()
        .on('data', async (event) => {
          // address ownerDoc, uint256 tokenID, bool forTransfer
          const userAddress = event.returnValues.ownerDoc;
          // const tokenID = parseInt(event.returnValues.tokenID);
          // const isForTransfer = event.returnValues.forTransfer;

          const accounts = await web3.eth.getAccounts();

          if (userAddress === accounts[0]) {
            dispatch(fetchDocumentsOriginals());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventDeleteDocummentEmitter.removeAllListeners(); });

      const eventShareDocEmitter = savDocContract.events.ShareDoc()
        .on('data', async (event) => {
          // address from, address to, uint256 tokenID
          // const from = event.returnValues.from;
          const to = event.returnValues.to;
          // const tokenID = event.returnValues.tokenID;

          const accounts = await web3.eth.getAccounts();

          if (to === accounts[0]) {
            dispatch(fetchDocumentsShared());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventShareDocEmitter.removeAllListeners(); });

      const eventDeleteMyDocCopyEmitter = savDocContract.events.DeleteMyDocCopy()
        .on('data', async (event) => {
          // address ownerDoc, uint256 tokenID
          const userAddress = event.returnValues.ownerDoc;
          // const tokenID = event.returnValues.tokenID;

          const accounts = await web3.eth.getAccounts();

          if (userAddress === accounts[0]) {
            dispatch(fetchDocumentsShared());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventDeleteMyDocCopyEmitter.removeAllListeners(); });
    }

    return () => {
      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i]();
      }
    }
  }, [dispatch, web3, savDocContract]);

  useEffect(() => {
    switch (category) {
      case 'original':
        dispatch(fetchDocumentsOriginals());
        break;

      case 'shared':
        dispatch(fetchDocumentsShared());
        break;

      default:
        break;
    }
  }, [dispatch, savDocContract, category]);

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
      dispatch(decryptFile(fileToShow.data));
    } else {
      setFile(null);
    }
  }, [dispatch, fileToShow]);

  useEffect(() => {
    if (fileToShow && decryptedFiles && decryptedFiles[fileToShow.data.tokenID]) {
      setFile(decryptedFiles[fileToShow.data.tokenID].data);
    }
  }, [dispatch, fileToShow, decryptedFiles]);

  useEffect(() => {
    if (fileToShare) {
      handleOpenSendDocumentDialog();
    }
  }, [dispatch, fileToShare]);

  useEffect(() => {
    if (fileToDelete) {
      if (0 === fileToDelete.data.typeNft || '0' === fileToDelete.data.typeNft) {
        dispatch(deleteDocument(fileToDelete.data.tokenID, false));
      } else {
        dispatch(deleteSharedDocument(fileToDelete.data.tokenID));
      }
    } else {
      deleteFile(null);
    }
  }, [dispatch, fileToDelete]);

  const handleClose = () => {
    dispatch(hideFile());
  };

  const changeCategory = (category) => {
    setCategory(category);
  };

  return (
    <>
      <div className={classes.root}>
        <AppBar color="default" position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography display="inline" variant="h6" className={classes.title}>SAV-Doc</Typography>
            <ToggleThemeModeButton />
          </Toolbar>
        </AppBar>

        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              <ListItem button key="Mes documents" onClick={(event) => changeCategory('original')}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Mes documents" />
              </ListItem>

              <ListItem button key="Documents" onClick={(event) => changeCategory('shared')}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Documents partagés" />
              </ListItem>
            </List>
          </div>
        </Drawer>

        <main className={classes.content}>
          <Toolbar />
          <FileManager fileMap={fileMap} enabledFileActions={('original' === category) ? ['share', 'delete'] :  ['delete']} />

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

          {(fileToShare && fileToShare.data)
            ? (
              <SendDocumentDialog
                doc={fileToShare.data}
                title="Partage"
                open={openSendDocumentDialog}
                handleClose={handleCloseSendDocumentDialog}
              />
            )
            : (<></>)
          }
        </main>
      </div>
    </>
  );
};

export default DocumentsViewer;
