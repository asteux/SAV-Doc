import React from "react";
import { Grid } from "@material-ui/core";

import FileManagerNavigation from "./file-manager-navigation";
import FileManagerToolbar from "./file-manager-toolbar";

const FileManagerHeader = () => {
  return (
    <header>
      <Grid container>
        <Grid item xs={12} md={6}>
          <FileManagerNavigation />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileManagerToolbar />
        </Grid>
      </Grid>
    </header>
  );
};

export default FileManagerHeader;
