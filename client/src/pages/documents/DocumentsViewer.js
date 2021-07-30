import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, makeStyles, Toolbar, Typography } from "@material-ui/core";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import { fetchDocumentsOriginals } from "../../features/contracts/docManagerContractSlice";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
}));

const DocumentsViewer = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const docManagerContract = useSelector(state => state.docManagerContract.contract);
  const fetchDocumentsOriginalsState = useSelector(state => state.docManagerContract.fetchDocumentsOriginalsState);

  useEffect(() => {
    if (docManagerContract) {
      dispatch(fetchDocumentsOriginals());
    }
  }, [dispatch, docManagerContract]);

  return (
    <>
      <AppBar color="default" position="sticky">
        <Toolbar>
          <Typography display="inline" variant="h6" className={classes.title}>SAV-Doc</Typography>
          <ToggleThemeModeButton />
        </Toolbar>
      </AppBar>

      <main>
        {/* TODO: add File Manager */}
      </main>
    </>
  );
};

export default DocumentsViewer;
