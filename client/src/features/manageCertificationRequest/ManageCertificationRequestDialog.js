import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControlLabel, makeStyles, Step, StepLabel, Stepper
} from '@material-ui/core';

import { decryptFile } from "../contracts/savDocContractSlice";
import FileViewer from "../FileViewer/components/file-viewer";
import { nextStep, reset, sendAcceptCertificationRequest, sendRejectCertificationRequest, setDoc, setOriginalFile } from "./manageCertificationRequestSlice";

const useStyles = makeStyles((theme) => ({
  stepper: {
    backgroundColor: 'transparent',
  },
  backdrop: {
    flexDirection: 'column',
    zIndex: theme.zIndex.tooltip + 1,
  },
}));

const ManageCertificationRequestDialog = ({ doc, title, open, handleClose }) => {
  const dispatch = useDispatch();

  const classes = useStyles();

  const [choice, setChoice] = useState(null);
  const [keepDoc, setKeepDoc] = useState(false);

  const manageCertificationState = useSelector((state) => {
    switch (choice) {
      case 'acceptCertification':
        return state.manageCertificationRequest.acceptCertificationRequest;

      case 'rejectCertification':
        return state.manageCertificationRequest.rejectCertificationRequest;

      default:
        break;
    }
  });

  const activeStep = useSelector((state) => state.manageCertificationRequest.activeStep);
  const originalFile = useSelector((state) => state.manageCertificationRequest.originalFile);

  const decryptedFiles = useSelector(state => state.savDocContract.decryptedFiles);

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
    if (manageCertificationState && 'loading' === manageCertificationState.status) {
      dispatch(nextStep());
    }
  }, [dispatch, manageCertificationState]);

  const handleDecryptFile = () => {
    dispatch(decryptFile(doc));
  }

  const handleSendAcceptTransaction = async (event) => {
    setChoice('acceptCertification');
    dispatch(sendAcceptCertificationRequest(keepDoc));
  };

  const handleSendRejectTransaction = async (event) => {
    setChoice('rejectCertification');
    dispatch(sendRejectCertificationRequest());
  };

  const steps = [
    'Déchiffrement du document',
    'Gérer la certification du document',
  ];
  let stepsContent = [
    (
      <>
        <DialogContent>
          <DialogContentText className="text-center">
            Pour certifier un document, commencer par le dévérouiller.
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
          <div className="mb-3 text-center">
            <DialogContentText>
              Voici le document que vous pouvez certifier
            </DialogContentText>

            <FormControlLabel
              control={
                <Checkbox
                  checked={keepDoc}
                  onChange={(event) => { setKeepDoc(event.target.checked) }}
                  name="checkedB"
                  color="primary"
                />
              }
              label="Garder une copie du document"
            />
          </div>

          <FileViewer file={originalFile} />
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={handleClose}>
            Annuler
          </Button>

          <Button color="primary" onClick={handleSendRejectTransaction}>
            Ne pas certifier
          </Button>

          <Button color="primary" onClick={(event) => { handleSendAcceptTransaction() }}>
            Certifier
          </Button>
        </DialogActions>
      </>
    ),
    (() => {
      let afterStepperContent = <></>;
      if (manageCertificationState) {
        switch (manageCertificationState.status) {
          case 'loading':
            afterStepperContent = (
              <>
                <DialogContent>
                  <FileViewer file={originalFile} />

                  <div className="mt-3 text-center">
                    <DialogContentText>
                      Envoie du document en cours
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
      }

      return afterStepperContent;
    })(),
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="Certification"
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
      </Dialog>
    </>
  );
};

export default ManageCertificationRequestDialog;
