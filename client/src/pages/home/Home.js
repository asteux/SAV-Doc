import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Button, Container, Grid, Link, makeStyles,
  Toolbar, Typography, useMediaQuery, useTheme
} from "@material-ui/core";
import { Image } from "react-bootstrap";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import { useDispatch, useSelector } from "react-redux";
import PasswordMasterDialog from "../../features/password-master/PasswordMasterDialog";
import RegistrationDialog from "../../features/registration/RegistrationDialog";

import SavDocSecurisationImage from '../../assets/savdoc-securisation.png';
import SavDocPartageImage from '../../assets/savdoc-transfert.png';
import SavDocCertificationImage from '../../assets/savdoc-certification.png';

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  link: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    '&:hover': {
      color: theme.palette.text.primary,
    }
  },
}));

const Home = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const accounts = useSelector((state) => state.web3.accounts);
  const savDocContract = useSelector((state) => state.savDocContract.contract);
  const userInformationsState = useSelector((state) => state.savDocContract.userInformations);
  const passwordMaster = useSelector((state) => state.savDocContract.passwordMaster);

  const registered = useMemo(() => {
    return !!userInformationsState.data;
  }, [userInformationsState]);
  const logged = useMemo(() => {
    return registered && passwordMaster;
  }, [registered, passwordMaster]);

  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const handleOpenLoginDialog = (event) => setOpenLoginDialog(true);
  const handleCloseLoginDialog = (event) => setOpenLoginDialog(false);

  const [openRegistrationDialog, setOpenRegistrationDialog] = useState(false);
  const handleOpenRegistrationDialog = (event) => setOpenRegistrationDialog(true);
  const handleCloseRegistrationDialog = (event) => setOpenRegistrationDialog(false);

  useEffect(() => {
    if (savDocContract && accounts) {
      handleCloseLoginDialog();
      handleCloseRegistrationDialog();
    }
  }, [dispatch, savDocContract, accounts]);

  const buttonMainAction = (registered)
    ? (
      (logged)
        ? <Button component={RouterLink} variant="contained" color="primary" to="/documents">Accéder à mes documents</Button>
        : <Button variant="contained" color="primary" onClick={handleOpenLoginDialog}>Se connecter</Button>
    )
    : <Button variant="contained" color="primary" onClick={handleOpenRegistrationDialog}>S'inscrire</Button>
  ;

  return (
    <>
      <AppBar color="default" position="sticky">
        {isSmallScreen
          ? (
            <Toolbar>
              <Typography display="inline" variant="h6" className={classes.title}>SAV-Doc</Typography>
              <ToggleThemeModeButton />
            </Toolbar>
          )
          : (
            <Toolbar>
              <div className={classes.title}>
                <Typography display="inline" variant="h6">
                  SAV-Doc
                </Typography>
                <Typography display="inline" noWrap>
                  <Link className={classes.link} color="inherit" href="#presentation">Présentation</Link>
                  <Link className={classes.link} color="inherit" href="#securisation">Sécurisation</Link>
                  <Link className={classes.link} color="inherit" href="#partage">Partage</Link>
                  <Link className={classes.link} color="inherit" href="#certification">Certification</Link>
                </Typography>
              </div>
              <ToggleThemeModeButton />
              {buttonMainAction}
            </Toolbar>
          )
        }
      </AppBar>

      <main>
        <div id="presentation">
          <Container>
            <div className="position-relative overflow-hidden text-center">
              <div className="p-lg-5 my-5">
                <Typography variant="h2" className="mb-3">SAV-Doc</Typography>
                <Typography variant="h5" className="mb-4">Avec SAV Doc, utiliser un coffre-fort numérique personnel pour sécuriser, approuver et vérifier vos documents</Typography>
                {buttonMainAction}
              </div>
            </div>
          </Container>
        </div>

        <div id="securisation" className="py-5">
          <Container fixed>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7} className="order-last order-md-first">
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src={SavDocSecurisationImage} alt="coffre fort" rounded />
                </div>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography className="mb-3" variant="h4">Sécuriser</Typography>
                <Typography variant="h5">Avec SAV Doc, vous pouvez stocker un document de manière sécurisé et confidentiel.</Typography>
                <Typography variant="h5">Vous êtes la seule personne qui est propriètaire du document et qui peut le consulter.</Typography>
              </Grid>
            </Grid>
          </Container>
        </div>

        <div id="partage" className="py-5">
          <Container fixed>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Typography className="mb-3" variant="h4">Partager</Typography>
                <Typography variant="h5">Vous pouvez transmettre et partager de manière sécurisé et confidentiel un document</Typography>
              </Grid>

              <Grid item xs={12} md={7}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src={SavDocPartageImage} alt="partage" rounded />
                </div>
              </Grid>
            </Grid>
          </Container>
        </div>

        <div id="certification" className="py-5">
          <Container fixed>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7} className="order-last order-md-first">
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src={SavDocCertificationImage} alt="document certifié" rounded />
                </div>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography className="mb-3" variant="h4">Certifier</Typography>
                <Typography variant="h5">Vous pouvez aussi envoyer des demandes de signatures. Le document sera partagé uniquement aux différents signataires</Typography>
              </Grid>
            </Grid>
          </Container>
        </div>

        <div className="py-5">
          <Container fixed className="text-center">
            {buttonMainAction}
            {/* <div className="position-relative overflow-hidden text-center">
              <div className="p-lg-5 my-5">
                <Typography variant="h5" className="mb-4">SAV Doc, la solution 100 % décentralisée</Typography>
                {buttonMainAction}
              </div>
            </div> */}
          </Container>
        </div>
      </main>

      {(!registered)
        ? (
          <RegistrationDialog
            open={openRegistrationDialog}
            handleClose={handleCloseRegistrationDialog}
          />
        )
        : (
          (!logged)
            ? (
              <PasswordMasterDialog
                open={openLoginDialog}
                handleClose={handleCloseLoginDialog}
              />
            )
            : <></>
        )
      }
    </>
  );
};

export default Home;
