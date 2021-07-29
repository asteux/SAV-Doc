import React from "react";
import { AppBar, Container, makeStyles, Toolbar, Typography } from "@material-ui/core";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import SecureFile from "../../features/secureFile/SecureFile";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
}));

const DocumentSecure = () => {
  const classes = useStyles();

  return (
    <>
      <AppBar color="default" position="sticky">
        <Toolbar>
          <Typography display="inline" variant="h6" className={classes.title}>SAV-Doc</Typography>
          <ToggleThemeModeButton />
        </Toolbar>
      </AppBar>

      <main className="py-4">
        <Container>
          <SecureFile />
        </Container>
      </main>
    </>
  );
};

export default DocumentSecure;
