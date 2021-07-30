import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, makeStyles } from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

import { goToParentDirectory, goToPreviousDirectory, goToNextDirectory } from "../file-manager-slice";

const useStyles = makeStyles((theme) => ({
  line: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
}));

const FileManagerNavigation = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const history = useSelector((state => state.fileManager.history));
  const historyIndex = useSelector((state => state.fileManager.historyIndex));

  const currentDirectory = useMemo(() => history[historyIndex], [history, historyIndex]);

  const handleClickPreviousDirectory = () => {
    dispatch(goToPreviousDirectory());
  };

  const handleClickNextDirectory = () => {
    dispatch(goToNextDirectory());
  };

  const handleClickParentDirectory = () => {
    dispatch(goToParentDirectory());
  };

  return (
    <div className={ classes.line }>
      <IconButton onClick={handleClickPreviousDirectory} disabled={(historyIndex) ? 0 === historyIndex : true}>
        <ArrowBackIcon />
      </IconButton>

      <IconButton onClick={handleClickNextDirectory} disabled={(history && history[historyIndex]) ? history.length - 1 === historyIndex : true}>
        <ArrowForwardIcon />
      </IconButton>

      <IconButton onClick={handleClickParentDirectory} disabled={(currentDirectory) ? 1 === currentDirectory.length : true}>
        <ArrowUpwardIcon />
      </IconButton>
    </div>
  );
};

export default FileManagerNavigation;
