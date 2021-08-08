import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Backdrop, CircularProgress, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import FolderIcon from '@material-ui/icons/Folder';
import { useHistory } from "react-router";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import FileManager from "../../features/FileManager/components/file-manager";
import { deleteFile, hideFile, setAction } from "../../features/FileManager/file-manager-slice";
import FileViewer from "../../features/FileViewer/components/file-viewer";
import { decryptFile, deleteDocument, deleteSharedDocument, fetchDocumentsCertified, fetchDocumentsOriginals, fetchDocumentsShared } from "../../features/contracts/savDocContractSlice";
import DocumentInformationsDialog from "../../features/documentInformations/DocumentInformationsDialog";
import ManageCertificationRequestDialog from "../../features/manageCertificationRequest/ManageCertificationRequestDialog";
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
  backdropClose: {
    position: 'fixed',
    top: '0.5rem',
    right: '0.5rem',
  }
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
  const fetchDocumentsCertifiedState = useSelector(state => state.savDocContract.fetchDocumentsCertifiedState);
  const decryptedFiles = useSelector(state => state.savDocContract.decryptedFiles);
  const fileManagerAction = useSelector(state => state.fileManager.action);
  const actionFile = useSelector(state => state.fileManager.actionFile);

  const [openDocumentInformationsDialog, setOpenDocumentInformationsDialog] = useState(false);
  const handleOpenDocumentInformationsDialog = (event) => setOpenDocumentInformationsDialog(true);
  const handleCloseDocumentInformationsDialog = (event) => setOpenDocumentInformationsDialog(false);

  const [openSendDocumentDialog, setOpenSendDocumentDialog] = useState(false);
  const handleOpenSendDocumentDialog = (event) => setOpenSendDocumentDialog(true);
  const handleCloseSendDocumentDialog = (event) => setOpenSendDocumentDialog(false);

  const [openManageCertificationDialog, setOpenManageCertificationDialog] = useState(false);
  const handleOpenManageCertificationDialog = (event) => setOpenManageCertificationDialog(true);
  const handleCloseManageCertificationDialog = (event) => setOpenManageCertificationDialog(false);

  const fileMap = useMemo(() => {
    switch (category) {
      case 'original':
        return fetchDocumentsOriginalsState.fileMap;

      case 'certified':
        return fetchDocumentsCertifiedState.fileMap;

      case 'shared':
        return fetchDocumentsSharedState.fileMap;

      default:
        break;
    }
  }, [category, fetchDocumentsOriginalsState, fetchDocumentsSharedState, fetchDocumentsCertifiedState]);

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

      const eventRequestCertificationEmitter = savDocContract.events.RequestCertification()
        .on('data', async (event) => {
          // address applicant, uint256 tokenID
          const applicant = event.returnValues.applicant;
          // const tokenID = event.returnValues.tokenID;

          const accounts = await web3.eth.getAccounts();

          if (applicant === accounts[0]) {
            dispatch(fetchDocumentsCertified());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventRequestCertificationEmitter.removeAllListeners(); });

      const eventAcceptCertificationRequestEmitter = savDocContract.events.AcceptCertificationRequest()
        .on('data', async (event) => {
          // address certifying, address applicant, uint256 tokenID, bool keepCopy
          const certifying = event.returnValues.certifying;
          const applicant = event.returnValues.applicant;
          // const tokenID = event.returnValues.tokenID;
          // const keepCopy = event.returnValues.keepCopy;

          const accounts = await web3.eth.getAccounts();

          if (certifying === accounts[0]) {
            dispatch(fetchDocumentsShared());
            dispatch(fetchDocumentsCertified());
          } else if (applicant === accounts[0]) {
            dispatch(fetchDocumentsOriginals());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventAcceptCertificationRequestEmitter.removeAllListeners(); });

      const eventRejectCertificationRequestEmitter = savDocContract.events.RejectCertificationRequest()
        .on('data', async (event) => {
          // address certifying, address applicant, uint256 tokenID
          const certifying = event.returnValues.certifying;
          // const applicant = event.returnValues.applicant;
          // const tokenID = event.returnValues.tokenID;

          const accounts = await web3.eth.getAccounts();

          if (certifying === accounts[0]) {
            dispatch(fetchDocumentsCertified());
          }
        })
        .on('error', (event) => {
          console.error(event);
        })
      ;

      callbacks.push(() => { eventRejectCertificationRequestEmitter.removeAllListeners(); });

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

      case 'certified':
        dispatch(fetchDocumentsCertified());
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
    if (actionFile && actionFile.type && actionFile.data) {
      switch (actionFile.type) {
        case 'show':
          if (actionFile.data) {
            dispatch(decryptFile(actionFile.data));
          } else {
            setFile(null);
          }
          break;

        case 'showInformations':
          if (actionFile.data) {
            handleOpenDocumentInformationsDialog();
          }
          break;

        case 'requestCertification':
          if (actionFile.data) {
            handleOpenSendDocumentDialog();
          }
          break;

        case 'manageCertificationRequest':
          if (actionFile.data) {
            handleOpenManageCertificationDialog();
          }
          break;

        case 'share':
          if (actionFile.data) {
            handleOpenSendDocumentDialog();
          }
          break;

        case 'delete':
          if (actionFile.data) {
            if (0 === actionFile.data.typeNft || '0' === actionFile.data.typeNft) {
              dispatch(deleteDocument(actionFile.data.tokenID, false));
            } else {
              dispatch(deleteSharedDocument(actionFile.data.tokenID));
            }
          } else {
            deleteFile(null);
          }
          break;

        default:
          break;
      }
    }
  }, [dispatch, actionFile]);

  useEffect(() => {
    let file = null;
    if (actionFile && actionFile.type && actionFile.data) {
      if (actionFile && actionFile.data && decryptedFiles && decryptedFiles[actionFile.data.tokenID]) {
        file = decryptedFiles[actionFile.data.tokenID].data;
      }
    }

    setFile(file);
  }, [dispatch, actionFile, decryptedFiles]);

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

              <ListItem button key="Documents partagés" onClick={(event) => changeCategory('shared')}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Documents partagés" />
              </ListItem>

              <ListItem button key="Documents à certifier" onClick={(event) => changeCategory('certified')}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Documents à certifier" />
              </ListItem>
            </List>
          </div>
        </Drawer>

        <main className={classes.content}>
          <Toolbar />
          <FileManager
            fileMap={fileMap}
            enabledFileActions={
              ((category) => {
                switch (category) {
                  case 'original':
                    return ['showInformations', 'requestCertification', 'share', 'delete'];

                  case 'certified':
                    return ['showInformations', 'manageCertificationRequest'];

                  case 'shared':
                    return ['showInformations', 'delete'];

                  default:
                    return [];
                }
              })(category)
            }
          />

          <Backdrop className={classes.backdrop} open={!!actionFile && 'show' === actionFile.type && !!actionFile.data} onClick={handleClose}>
            <IconButton className={classes.backdropClose} aria-label="delete">
              <CloseIcon fontSize="large" onClick={handleClose} />
            </IconButton>

            {
              (file)
                ? (
                  <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', margin: '1rem' }}>
                    <FileViewer file={file} />
                  </div>
                )
                : (
                  <CircularProgress color="inherit" />
                )
            }

          </Backdrop>

          {(!!actionFile && 'showInformations' === actionFile.type && !!actionFile.data)
            ? (
              <DocumentInformationsDialog
                doc={actionFile.data}
                open={openDocumentInformationsDialog}
                handleClose={handleCloseDocumentInformationsDialog}
              />
            )
            : (<></>)
          }

          {(!!actionFile && 'requestCertification' === actionFile.type && !!actionFile.data)
            ? (
              <SendDocumentDialog
                type="requestCertification"
                doc={actionFile.data}
                title="Demande de certification"
                open={openSendDocumentDialog}
                handleClose={handleCloseSendDocumentDialog}
              />
            )
            : (<></>)
          }

          {(!!actionFile && 'manageCertificationRequest' === actionFile.type && !!actionFile.data)
            ? (
              <ManageCertificationRequestDialog
                doc={actionFile.data}
                title="Gérer la certification"
                open={openManageCertificationDialog}
                handleClose={handleCloseManageCertificationDialog}
              />
            )
            : (<></>)
          }

          {(!!actionFile && 'share' === actionFile.type && !!actionFile.data)
            ? (
              <SendDocumentDialog
                type="share"
                doc={actionFile.data}
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
