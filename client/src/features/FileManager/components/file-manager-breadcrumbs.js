import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Breadcrumbs, Link, makeStyles, Typography } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';

import { setCurrentDirectory } from "../file-manager-slice";

const useStyles = makeStyles((theme) => ({
  link: {
    "&:hover, &:focus": {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
}));

const FileManagerBreadcrumbs = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const history = useSelector((state => state.fileManager.history));
  const historyIndex = useSelector((state => state.fileManager.historyIndex));

  const currentDirectory = useMemo(() => history[historyIndex] ?? [""], [history, historyIndex]);

  const handleLinkClick = (event, pathDirectory) => {
    event.preventDefault();

    dispatch(setCurrentDirectory(pathDirectory));
  };

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        {currentDirectory.map((directory, index) => {
          const path = `/${currentDirectory.slice(0, index + 1).join('/')}`;
          const content = (0 === index)
            ? (<HomeIcon />)
            : (
              <>
                {directory}
              </>
            )
          ;

          return (index !== currentDirectory.length - 1)
            ? (
              <Link key={path} className={classes.link} color="inherit" href="#" onClick={(event) => handleLinkClick(event, currentDirectory.slice(0, index + 1))}>
                {content}
              </Link>
            )
            : (
              <Typography key={path} color="textPrimary">{content}</Typography>
            )
          ;
        })}
      </Breadcrumbs>
    </>
  );
};

export default FileManagerBreadcrumbs;
