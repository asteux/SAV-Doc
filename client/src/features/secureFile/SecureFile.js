import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Step, StepLabel, Stepper } from '@material-ui/core';

import UploadFileForm from './uploadFileForm/UploadFileForm';
import PasswordForm from './passwordForm/PasswordForm';
import { encryptFile, encryptIpfsCidAndPassword, nextStep, previousStep, reset, setOriginalIpfsCid } from './secureFileSlice';
import { storeBlob } from '../../utils/ipfs';

const SecureFile = () => {
  const dispatch = useDispatch();

  const themeMode = useSelector((state) => state.theme.mode);
  const themeContrast = useSelector((state) => state.theme.contrast);

  const accounts = useSelector((state) => state.web3.accounts);
  const activeStep = useSelector((state) => state.secureFile.activeStep);
  const originalFile = useSelector((state) => state.secureFile.originalFile);
  const originalPasswordFile = useSelector((state) => state.secureFile.originalPasswordFile);
  const encryptedFile = useSelector((state) => state.secureFile.encryptedFile);
  const encryptedPasswordFile = useSelector((state) => state.secureFile.encryptedPasswordFile);
  const encryptedIpfsCid = useSelector((state) => state.secureFile.encryptedIpfsCid);

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
    if (null !== encryptedFile) {
      dispatch(nextStep());

      (async () => {
        const cid = await storeBlob(encryptedFile);

        dispatch(setOriginalIpfsCid(cid));
        dispatch(encryptIpfsCidAndPassword(cid, originalPasswordFile, accounts[0]));
      })();
    }
  }, [dispatch, encryptedFile, originalPasswordFile, accounts]);

  useEffect(() => {
    if (
      null !== encryptedIpfsCid
      && null !== encryptedPasswordFile
    ) {
      dispatch(nextStep());

      // TODO: mint NFT
    }
  }, [dispatch, encryptedIpfsCid, encryptedPasswordFile, accounts]);

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleReset = () => {
    dispatch(reset(0));
  };

  const handleEncrypt = () => {
    dispatch(encryptFile(originalFile, originalPasswordFile));
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
        <p className={ `lead text-center text-${themeContrast}`}>En cliquant sur "Sécuriser ce document", SAV-Doc va chiffrer et uploader le document.</p>
        {/* TODO: show file */}
      </>
    ),
    (
      <>
        <p className={ `lead text-center text-${themeContrast}`}>Votre document a été chiffré. Il est en cours d'upload</p>
      </>
    ),
    (
      <>
        <p className={ `lead text-center text-${themeContrast}`}>Votre document a été uploadé. Il ne reste que l'enregistrement dans la blockchain</p>
      </>
    ),
    (
      <div>
        {/* TODO: show file */}
        <p className={ `lead text-center text-${themeContrast}`}>Le document a été sécurisé</p>

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
        <h2 className={ `text-center text-${themeContrast}`}>Sécuriser un document</h2>
        <Stepper alternativeLabel activeStep={activeStep} className={ `bg-${themeMode}` }>
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

      <footer>
        <Container>
          <Row>
            <Col className="p-0">
              {0 !== activeStep && steps.length - 2 > activeStep
                ? (
                  <Button variant="outline-primary" disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                )
                : <></>
              }
            </Col>

            <Col className="p-0 text-right">
              {1 === activeStep
                ? <Button variant="primary" type="submit" form="secure-file-password-form">Utiliser ce mot de passe</Button>
                : <></>
              }
              {2 === activeStep
                ? <Button onClick={handleEncrypt}>Sécuriser ce document</Button>
                : <></>
              }
            </Col>
          </Row>
        </Container>
      </footer>
    </section>
  );
};

export default SecureFile;
