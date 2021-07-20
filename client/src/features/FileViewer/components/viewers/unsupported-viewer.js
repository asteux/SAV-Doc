import React from "react";
import { Typography } from '@material-ui/core';

const UnsupportedViewer = ({ file, fileType, height }) => {
  return (
    <>
      <Typography className="text-center">Ce fichier ne peut pas être affiché</Typography>
    </>
  );
};

export default UnsupportedViewer;
