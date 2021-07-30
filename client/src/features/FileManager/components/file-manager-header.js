import React from "react";
import { Grid } from "@material-ui/core";

import FileManagerNavigation from "./file-manager-navigation";

const FileManagerHeader = () => {
  return (
    <header>
      <Grid container>
        <Grid item xs={12} md={8}>
          <FileManagerNavigation />
        </Grid>

        <Grid item xs={12} md={4}>
          {/* TODO: add toolbar */}
        </Grid>
      </Grid>
    </header>
  );
};

export default FileManagerHeader;
