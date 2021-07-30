import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, makeStyles, Toolbar, Typography } from "@material-ui/core";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';
import FileManager from "../../features/FileManager/components/file-manager";
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
        <FileManager fileMap={fetchDocumentsOriginalsState.fileMap} />
      </main>
    </>
  );
};

export default DocumentsViewer;
