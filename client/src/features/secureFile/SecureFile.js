import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import { Step, StepLabel, Stepper } from '@material-ui/core';

import UploadFileForm from './uploadFileForm/UploadFileForm';
import PasswordForm from './passwordForm/PasswordForm';
import { encryptFile, encryptPassword, nextStep, previousStep, reset } from './secureFileSlice';

const SecureFile = () => {
  const dispatch = useDispatch();

  const accounts = useSelector((state) => state.web3.accounts);
  const activeStep = useSelector((state) => state.secureFile.activeStep);
  const originalFile = useSelector((state) => state.secureFile.originalFile);
  const originalPasswordFile = useSelector((state) => state.secureFile.originalPasswordFile);
  const encryptedFile = useSelector((state) => state.secureFile.encryptedFile);
  const encryptedPasswordFile = useSelector((state) => state.secureFile.encryptedPasswordFile);

  useEffect(() => {
    if (null !== originalFile) {
      dispatch(nextStep());
    }
  }, [dispatch, originalFile]);

  useEffect(() => {
    if (null !== originalPasswordFile) {
      dispatch(nextStep());
    }
  }, [dispatch, originalPasswordFile]);

  useEffect(() => {
    if (
      null !== encryptedFile
      && null !== encryptedPasswordFile
    ) {
      dispatch(nextStep());
    }
  }, [dispatch, encryptedFile, encryptedPasswordFile]);

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleReset = () => {
    dispatch(reset(0));
  };

  const handleEncrypt = () => {
    dispatch(encryptFile(originalFile, originalPasswordFile));
    dispatch(encryptPassword(originalPasswordFile, accounts[0]));
  };

  const steps = [
    'Choix du document',
    'Choix du mot de passe',
    'Chiffrement',
    'Upload',
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
        <PasswordForm />
      </>
    ),
    (
      <>
        <p className="lead text-center">En cliquant sur "Sécuriser ce document", SAV-Doc va chiffrer le document.</p>
        {/* TODO: show file */}
      </>
    ),
    (
      <>
        {/* TODO: show file */}
        {/* TODO: Upload du document */}
      </>
    ),
    (
      <>
        {/* TODO: show file */}
        {/* TODO: Enregistrement dans la blockchain */}
      </>
    ),
    (
      <div>
        {/* TODO: show file */}
        <p className="text-center">Le document a été sécurisé</p>

        <div>
          <div>
            <Button onClick={handleReset}>
              Sécuriser un autre document
            </Button>
          </div>

          <div>
            <Button>
              Consulter le document
            </Button>
          </div>
        </div>
      </div>
    ),
  ];

  return (
    <section>
      <header>
        <h2 className="text-center">Sécuriser un document</h2>
        <Stepper alternativeLabel activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </header>

      <div>
        {stepsContent[activeStep]}
      </div>

      {0 !== activeStep && steps.length - 2 > activeStep
        ? (
          <footer>
              <div className="d-flex justify-content-between">
                <Button variant="outline-primary" disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                {1 === activeStep
                  ? <Button variant="primary" type="submit" form="secure-file-password-form">Utiliser ce mot de passe</Button>
                  : <></>
                }
                {2 === activeStep
                  ? <Button onClick={handleEncrypt}>Sécuriser ce document</Button>
                  : <></>
                }
              </div>
          </footer>
        )
        : <></>
      }
    </section>
  );
};

export default SecureFile;
