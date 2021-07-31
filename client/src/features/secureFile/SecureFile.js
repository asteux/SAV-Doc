import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from 'react-router-dom';
import { Backdrop, Button, CircularProgress, Grid, makeStyles, Step, StepLabel, Stepper, Typography } from '@material-ui/core';

import UploadFileForm from './uploadFileForm/UploadFileForm';
import { encryptFile, encryptIpfsCidAndPassword, nextStep, previousStep, reset, sendTransactionToSecure, setOriginalPasswordFile, uploadFile } from './secureFileSlice';
import FileViewer from "../FileViewer/components/file-viewer";
import { generatePassword } from '../../utils/password';

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

const SecureFile = () => {
  const dispatch = useDispatch();

  const classes = useStyles();

  const accounts = useSelector((state) => state.web3.accounts);
  const passwordMaster = useSelector((state) => state.savDocContract.passwordMaster);
  const secureDocumentState = useSelector((state) => state.savDocContract.secureDocument);
  const loadingMessage = useSelector((state) => state.secureFile.loadingMessage);
  const activeStep = useSelector((state) => state.secureFile.activeStep);
  const originalFile = useSelector((state) => state.secureFile.originalFile);
  const originalPasswordFile = useSelector((state) => state.secureFile.originalPasswordFile);
  const originalIpfsCid = useSelector((state) => state.secureFile.originalIpfsCid);
  const encryptedFile = useSelector((state) => state.secureFile.encryptedFile);
  const encryptedPasswordFile = useSelector((state) => state.secureFile.encryptedPasswordFile);
  const encryptedIpfsCid = useSelector((state) => state.secureFile.encryptedIpfsCid);

  const isLoading = null !== loadingMessage;

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (null !== originalFile) {
      dispatch(setOriginalPasswordFile(generatePassword(32)));
    }
  }, [dispatch, originalFile]);

  useEffect(() => {
    if (null !== originalFile && null !== originalPasswordFile) {
      dispatch(nextStep());
    }
  }, [dispatch, originalFile, originalPasswordFile]);

  useEffect(() => {
    if (null !== encryptedFile) {
      (async () => {
        dispatch(uploadFile());
      })();
    }
  }, [dispatch, encryptedFile, originalPasswordFile, accounts]);

  useEffect(() => {
    if (null !== originalIpfsCid) {
      dispatch(nextStep());
    }
  }, [dispatch, originalIpfsCid]);

  useEffect(() => {
    if (
      null !== encryptedIpfsCid
      && null !== encryptedPasswordFile
    ) {
      dispatch(nextStep());
    }
  }, [dispatch, encryptedIpfsCid, encryptedPasswordFile, accounts]);

  useEffect(() => {
    if (
      null !== secureDocumentState
      && 'loading' === secureDocumentState.status
    ) {
      dispatch(nextStep());
    }
  }, [dispatch, secureDocumentState]);

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleReset = () => {
    dispatch(reset());
  };

  const handleEncryptFile = () => {
    dispatch(encryptFile());
  };

  const handleEncryptIpfsCidAndPassword = () => {
    dispatch(encryptIpfsCidAndPassword(passwordMaster));
  };

  const handleSendTransaction = () => {
    dispatch(sendTransactionToSecure());
  };

  const steps = [
    'Choix du document',
    'Chiffrement & Upload du document',
    'Chiffrement des informations',
    'Enregistrement dans la blockchain',
  ];
  let stepsContent = [
    (
      <>
        <UploadFileForm />
      </>
    ),
    (
      <>
        <FileViewer file={originalFile} />
        <div className="mt-5">
          <Typography variant="h6" className="text-center">En cliquant sur "Sécuriser ce document", SAV-Doc va chiffrer et uploader le document.</Typography>
        </div>
      </>
    ),
    (
      <>
        <FileViewer file={originalFile} />
        <div className="mt-5">
          <Typography variant="h6" className="text-center">Votre document a été uploadé.</Typography>
          <Typography variant="h6" className="text-center">Il ne reste que le chiffrement des différentes informations lié au document et à l'enregistrement dans la blockchain</Typography>
        </div>
      </>
    ),
    (
      <>
        <FileViewer file={originalFile} />
        <div className="mt-5">
          <Typography variant="h6" className="text-center">Veuillez cliquer sur "Envoyer les informations" et envoyer la transaction.</Typography>
        </div>
      </>
    ),
    (() => {
      let afterStepperContent = <></>;
      switch (secureDocumentState.status) {
        case 'loading':
          afterStepperContent = (
            <div>
              <FileViewer file={originalFile} />
              <div className="mt-5">
              </div>
              <Typography variant="h6" className="text-center">La transaction est en cours</Typography>
            </div>
          );
          break

        case 'succeeded':
          afterStepperContent = (
            <div>
              <FileViewer file={originalFile} />
              <div className="mt-5">
                <Typography variant="h6" className="text-center">Le document a été sécurisé</Typography>

                <Grid container className="mt-5">
                  <Grid item xs className="text-center">
                    <Button variant="contained" color="primary" onClick={handleReset}>
                      Sécuriser un autre document
                    </Button>
                  </Grid>

                  <Grid item xs className="text-center">
                    <Button component={RouterLink} variant="contained" color="primary" to="/documents">
                      Consulter le document
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </div>
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
      <section>
        <header>
          <Typography variant="h4" className="text-center mb-3">Sécuriser un document</Typography>
          <Stepper className={classes.stepper} alternativeLabel activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </header>

        <div className="mt-3">
          {stepsContent[activeStep]}
        </div>

        <footer className="mt-5">
          <Grid container>
            <Grid item xs className="p-0">
              {0 !== activeStep && steps.length - 2 > activeStep
                ? (
                  <Button variant="outlined" color="default" disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                )
                : <></>
              }
            </Grid>

            <Grid item xs className="p-0 text-right">
              {1 === activeStep
                ? <Button variant="contained" color="primary" onClick={handleEncryptFile}>Sécuriser ce document</Button>
                : <></>
              }
              {2 === activeStep
                ? <Button variant="contained" color="primary" onClick={handleEncryptIpfsCidAndPassword}>Chiffrer les informations</Button>
                : <></>
              }
              {3 === activeStep
                ? <Button variant="contained" color="primary" onClick={handleSendTransaction}>Envoyer les informations</Button>
                : <></>
              }
            </Grid>
          </Grid>
        </footer>
      </section>

      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
        <Typography className={classes.loadingMessage}>{ loadingMessage }</Typography>
      </Backdrop>
    </>
  );
};

export default SecureFile;
