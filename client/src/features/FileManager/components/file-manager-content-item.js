import React from "react";
import { useSelector } from "react-redux";
import { makeStyles, Typography } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  link: {
    cursor: 'pointer',
  },
  icon: {
    width: '100%',
    height: 'auto',
  },
}));

const FileManagerContentItem = ({ data, icon }) => {
  const classes = useStyles();

  const viewMode = useSelector((state => state.fileManager.viewMode));

  const handleDoubleClick = (event) => {
    if (data.isDir) {
      // TODO: Change current directory
    } else {
      // TODO: Print document
    }
  };

  let content = <></>;
  switch (viewMode) {
    case 'list':
      break;

    default: // = grid
      content = (
        <>
          <div className={classes.link} onDoubleClick={handleDoubleClick}>
            {icon}
            <Typography className="text-center">{data.name}</Typography>
          </div>
        </>
      );
      break;
  }

  return (
    <>{content}</>
  )
};

export default FileManagerContentItem;
