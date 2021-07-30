import React from "react";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

import FileManagerContentItem, { useStyles } from "./file-manager-content-item";

const FileManagerFile = ({ data }) => {
  const classes = useStyles();

  return (
    <FileManagerContentItem
      data={data}
      icon={<InsertDriveFileIcon className={classes.icon} />}
    />
  );
};

export default FileManagerFile;
