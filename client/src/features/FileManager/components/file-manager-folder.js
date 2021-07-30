import React from "react";
import FolderIcon from '@material-ui/icons/Folder';

import FileManagerContentItem, { useStyles } from "./file-manager-content-item";

const FileManagerFolder = ({ data }) => {
  const classes = useStyles();

  return (
    <FileManagerContentItem
      data={data}
      icon={<FolderIcon className={classes.icon} />}
    />
  );
};

export default FileManagerFolder;
