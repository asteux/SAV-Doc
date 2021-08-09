import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, Step, StepLabel, Stepper, Typography } from '@material-ui/core';

import { encryptAndUploadFile, nextStep, reset, sendTransaction, setDoc, setOriginalFile } from './acceptTransferSlice';
import { decryptFile } from "../contracts/savDocContractSlice";
import FileViewer from "../FileViewer/components/file-viewer";

const useStyles = makeStyles((theme) => ({
  stepper: {
    backgroundColor: 'transparent',
  },
  backdrop: {
    flexDirection: 'column',
    zIndex: theme.zIndex.tooltip + 1,
  },
  loadingMessage: {
    marginTop: '1rem',
  }
}));

const AcceptTransferDialog = ({ type, doc, title, open, handleClose }) => {
  const dispatch = useDispatch();

  const classes = useStyles();

  const acceptTransferDocumentState = useSelector((state) => state.savDocContract.acceptTransferDocument);
  const loadingMessage = useSelector((state) => state.acceptTransfer.loadingMessage);
  const activeStep = useSelector((state) => state.acceptTransfer.activeStep);
  const originalFile = useSelector((state) => state.acceptTransfer.originalFile);
  const originalPasswordFile = useSelector((state) => state.acceptTransfer.originalPasswordFile);
  const encryptedFile = useSelector((state) => state.acceptTransfer.encryptedFile);
  const encryptedPasswordFile = useSelector((state) => state.acceptTransfer.encryptedPasswordFile);
  const encryptedIpfsCid = useSelector((state) => state.acceptTransfer.encryptedIpfsCid);

  const decryptedFiles = useSelector(state => state.savDocContract.decryptedFiles);

  const isLoading = null !== loadingMessage;

  useEffect(() => {
    if (!open) {
      dispatch(reset());
    }
  }, [dispatch, open]);

  useEffect(() => {
    dispatch(setDoc(doc));
  }, [dispatch, doc]);

  useEffect(() => {
    if (doc && decryptedFiles && decryptedFiles[doc.tokenID]) {
      dispatch(setOriginalFile(decryptedFiles[doc.tokenID].data));
    }
  }, [dispatch, doc, decryptedFiles]);

  useEffect(() => {
    if (null !== originalFile) {
      dispatch(nextStep());
    }
  }, [dispatch, originalFile]);

  useEffect(() => {
    if (null !== encryptedFile && null !== encryptedPasswordFile && null !== encryptedIpfsCid) {
      dispatch(nextStep());
    }
  }, [dispatch, encryptedFile, encryptedPasswordFile, encryptedIpfsCid]);

  useEffect(() => {
    if (null !== originalFile && null !== originalPasswordFile) {
      dispatch(nextStep());
    }
  }, [dispatch, originalFile, originalPasswordFile]);

  useEffect(() => {
    if (
      null !== encryptedFile
      && null !== encryptedPasswordFile
      && null !== encryptedIpfsCid
      && null !== acceptTransferDocumentState
      && 'loading' === acceptTransferDocumentState.status
    ) {
      dispatch(nextStep());
    }
  }, [dispatch, encryptedFile, encryptedPasswordFile, encryptedIpfsCid, acceptTransferDocumentState]);

  const handleDecryptFile = () => {
    dispatch(decryptFile(doc));
  }

  const handleEncryptAndUploadFile = () => {
    dispatch(encryptAndUploadFile());
  };

  // const handleEncryptIpfsCidAndPassword = () => {
  //   dispatch(encryptIpfsCidAndPassword(passwordMaster));
  // };

  const handleSendTransaction = async () => {
    dispatch(sendTransaction(type));
  };

  const steps = [
    'Déchiffrement du document',
    'Chiffrement du document',
    'Upload et récpération du document',
    'Upload et récpération du document',
  ];
  let stepsContent = [
    (
      <>
        <DialogContent>
          <DialogContentText className="text-center">
            Pour récupérer le document, commencer par le déchiffrer.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={handleDecryptFile}>
            Déchiffrer le document
          </Button>
        </DialogActions>
      </>
    ),
    (
      <>
        <DialogContent>
          <FileViewer file={originalFile} />

          <div className="mt-3 text-center">
            <DialogContentText>
              Veuillez chiffrer le document.
            </DialogContentText>
          </div>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={handleEncryptAndUploadFile}>
            Chiffrer le document
          </Button>
        </DialogActions>
      </>
    ),
    (
      <>
        <DialogContent>
          <FileViewer file={originalFile} />

          <div className="mt-3 text-center">
            <DialogContentText>
              Veuillez récupérer le document.
            </DialogContentText>
          </div>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={handleSendTransaction}>
            Récupérer le document
          </Button>
        </DialogActions>
      </>
    ),
    (() => {
      let afterStepperContent = <></>;
      switch (acceptTransferDocumentState.status) {
        case 'loading':
          afterStepperContent = (
            <>
              <DialogContent>
                <FileViewer file={originalFile} />

                <div className="mt-3 text-center">
                  <DialogContentText>
                    Récupération du document en cours
                  </DialogContentText>
                </div>
              </DialogContent>
            </>
          );
          break

        case 'succeeded':
          afterStepperContent = (
            <>
              <DialogContent>
                <FileViewer file={originalFile} />

                <div className="mt-3 text-center">
                  <DialogContentText>
                    Le document a été récupéré
                  </DialogContentText>
                </div>
              </DialogContent>

              <DialogActions>
                <Button color="primary" onClick={handleClose}>
                  Fermer
                </Button>
              </DialogActions>
            </>
          );
          break

        case 'failed':
          break;

        default:
          break;
      }

      return afterStepperContent;
    })(),
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="Accept Transfer"
      >
        <DialogTitle id="form-dialog-title">{title} - {steps[activeStep]}</DialogTitle>
        <Stepper className={classes.stepper} alternativeLabel activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {stepsContent[activeStep]}

        <Backdrop className={classes.backdrop} open={isLoading}>
          <CircularProgress color="inherit" />
          <Typography className={classes.loadingMessage}>{ loadingMessage }</Typography>
        </Backdrop>
      </Dialog>
    </>
  );
};

export default AcceptTransferDialog;
