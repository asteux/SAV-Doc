import React, { useMemo, useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Button, Container, Grid, Link, makeStyles,
  Toolbar, Typography, useMediaQuery, useTheme
} from "@material-ui/core";
import { Image } from "react-bootstrap";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import { useSelector } from "react-redux";
import PasswordMasterDialog from "../../features/password-master/PasswordMasterDialog";
import RegistrationDialog from "../../features/registration/RegistrationDialog";

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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
                <Typography variant="h5" className="mb-4">Texte introduction SAV-Doc</Typography>
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
                  <Image src="" alt="coffre fort" rounded />
                </div>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h4">Sécuriser</Typography>
                <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque suscipit nisl euismod mauris interdum, quis vehicula est faucibus. Aliquam vitae sollicitudin sapien. Pellentesque sed varius urna. Cras quam nisl, dapibus quis gravida sed, pretium sed felis. Cras congue ultrices nisl vel faucibus. Nam at facilisis mi. Duis aliquet, leo nec auctor volutpat, risus magna blandit dolor, sed venenatis magna ex cursus mi. Sed eu nibh sit amet tortor convallis viverra. Pellentesque placerat egestas viverra. Nulla magna odio, cursus vitae fermentum eget, mattis id ex. Cras orci quam, placerat a tellus sit amet, imperdiet varius quam. Phasellus aliquam nisi ut sagittis pulvinar. Sed suscipit molestie turpis, id cursus ipsum faucibus at.</Typography>
              </Grid>
            </Grid>
          </Container>
        </div>

        <div id="partage" className="py-5">
          <Container fixed>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Typography variant="h4">Partager</Typography>
                <Typography>Nunc ornare consectetur enim, quis viverra tellus iaculis ut. Phasellus sodales nisl a arcu tempor pharetra. Integer feugiat tellus sagittis lacus accumsan suscipit. Fusce accumsan risus eu enim maximus varius. Quisque varius gravida dapibus. Morbi eget lorem et arcu ornare congue vitae id massa. Integer in porttitor enim. Ut posuere vulputate lorem, sit amet volutpat mauris elementum quis. Aliquam non lectus placerat, cursus urna ac, blandit nisl. Donec ac justo varius, vehicula quam nec, scelerisque nulla. Mauris nec nunc at urna auctor accumsan id sed nisl. Aenean ullamcorper porttitor lectus in imperdiet. In varius leo mollis massa auctor lobortis ac non ipsum. Maecenas dignissim feugiat malesuada.</Typography>
              </Grid>

              <Grid item xs={12} md={7}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src="" alt="partage" rounded />
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
                  <Image src="" alt="document certifié" rounded />
                </div>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h4">Certifier</Typography>
                <Typography>Praesent vel sapien non ipsum interdum aliquam in sed libero. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at felis nec sem sollicitudin viverra. Praesent a volutpat nisi. Vivamus sem tortor, accumsan a orci vel, sollicitudin consectetur leo. Sed lobortis ultricies purus, ut pharetra massa scelerisque lacinia. Nulla facilisi. Pellentesque nulla ante, dignissim scelerisque massa non, vestibulum pellentesque magna. Praesent tristique tincidunt vestibulum. Sed at faucibus velit. Donec rutrum augue in volutpat sollicitudin. Nam molestie purus sagittis quam lacinia, in lobortis sapien suscipit. Nullam sodales, sapien vel auctor luctus, elit justo elementum orci, ornare finibus tellus libero vel neque. Aenean placerat nibh eget fringilla maximus. Nunc posuere purus ac sodales volutpat. Quisque pellentesque, turpis nec porttitor efficitur, neque elit maximus lacus, ut hendrerit nibh tortor a sem.</Typography>
              </Grid>
            </Grid>
          </Container>
        </div>

        <div className="py-5">
          <Container fixed className="text-center">
            {buttonMainAction}
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
