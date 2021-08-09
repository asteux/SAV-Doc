import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, Step, StepLabel, Stepper, Typography } from '@material-ui/core';

import { encryptAndUploadFile, nextStep, reset, sendTransaction, setDoc, setOriginalFile } from './sendDocumentSlice';
import { decryptFile } from "../contracts/savDocContractSlice";
import EthereumAddressForm from "./components/EthereumAddressForm";
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

const SendDocumentDialog = ({ type, doc, title, open, handleClose }) => {
  const dispatch = useDispatch();

  const classes = useStyles();

  const sendDocumentState = useSelector((state) => {
    switch (type) {
      case 'requestCertification':
        return state.savDocContract.requestCertificationDocument;

      case 'share':
        return state.savDocContract.shareDocument;

      case 'transfer':
        return state.savDocContract.transferDocument;

      default:
        break;
    }
  });

  const accounts = useSelector((state) => state.web3.accounts);
  const loadingMessage = useSelector((state) => state.sendDocument.loadingMessage);
  const activeStep = useSelector((state) => state.sendDocument.activeStep);
  const originalFile = useSelector((state) => state.sendDocument.originalFile);
  const originalPasswordFile = useSelector((state) => state.sendDocument.originalPasswordFile);
  const encryptedFile = useSelector((state) => state.sendDocument.encryptedFile);
  const encryptedPasswordFile = useSelector((state) => state.sendDocument.encryptedPasswordFile);
  const encryptedIpfsCid = useSelector((state) => state.sendDocument.encryptedIpfsCid);

  const decryptedFiles = useSelector(state => state.savDocContract.decryptedFiles);
  const recipientAddress = useSelector((state) => state.sendDocument.recipientAddress);
  const recipientUser = useSelector((state) => state.sendDocument.recipientUser);

  const isLoading = null !== loadingMessage;

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(reset());
  }, [dispatch, accounts]);

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
    if (null !== recipientAddress && null !== recipientUser) {
      dispatch(nextStep());
    }
  }, [dispatch, recipientAddress, recipientUser]);

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

  // useEffect(() => {
  //   if (null !== originalIpfsCid) {
  //     dispatch(nextStep());
  //   }
  // }, [dispatch, originalIpfsCid]);

  // useEffect(() => {
  //   if (
  //     null !== encryptedIpfsCid
  //     && null !== encryptedPasswordFile
  //   ) {
  //     dispatch(nextStep());
  //   }
  // }, [dispatch, encryptedIpfsCid, encryptedPasswordFile, accounts]);

  useEffect(() => {
    if (
      null !== encryptedFile
      && null !== encryptedPasswordFile
      && null !== encryptedIpfsCid
      && null !== sendDocumentState
      && 'loading' === sendDocumentState.status
    ) {
      dispatch(nextStep());
    }
  }, [dispatch, encryptedFile, encryptedPasswordFile, encryptedIpfsCid, sendDocumentState]);

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
    'Choix du destinataire',
    'Chiffrement du document',
    'Upload et envoi du document',
    'Upload et envoi du document',
  ];
  let stepsContent = [
    (
      <>
        <DialogContent>
          <DialogContentText className="text-center">
            Pour envoyer un document, commencer par le dévérouiller.
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

          <div className="mt-3">
            <EthereumAddressForm />
          </div>
        </DialogContent>
      </>
    ),
    (
      <>
        <DialogContent>
          <FileViewer file={originalFile} />

          <div className="mt-3 text-center">
            <DialogContentText>
              Veuillez chiffrer et uploader le document.
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
              Veuillez envoyer le document.
            </DialogContentText>
          </div>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={handleSendTransaction}>
            Envoyer le document
          </Button>
        </DialogActions>
      </>
    ),
    (() => {
      let afterStepperContent = <></>;
      switch (sendDocumentState.status) {
        case 'loading':
          afterStepperContent = (
            <>
              <DialogContent>
                <FileViewer file={originalFile} />

                <div className="mt-3 text-center">
                  <DialogContentText>
                    Envoi du document en cours
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
                    Le document a été envoyé
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
        aria-labelledby="Registration"
      >
        <DialogTitle id="form-dialog-title">{title} - {steps[activeStep]}</DialogTitle>
        <Stepper className={classes.stepper} alternativeLabel activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={`send-document-label-${index}-${label}`}>
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

export default SendDocumentDialog;
