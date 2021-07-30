import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles, TableCell, TableRow, Typography } from "@material-ui/core";
import RemoveIcon from '@material-ui/icons/Remove';

import { setCurrentDirectory } from "../file-manager-slice";
import { humanFileSize } from "../../../utils/file";

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

  const dispatch = useDispatch();

  const viewMode = useSelector((state => state.fileManager.viewMode));

  const handleDoubleClick = (event) => {
    if (data.isDir) {
      dispatch(setCurrentDirectory([...data.directory, data.name]));
    } else {
      // TODO: Print document
    }
  };

  let content = <></>;
  switch (viewMode) {
    case 'list':
      content = (
        <>
          <TableRow key={data.name}>
            <TableCell component="th" padding="checkbox" scope="row">{icon}</TableCell>
            <TableCell>
              <Typography className={classes.link} onDoubleClick={handleDoubleClick}>{data.name}</Typography>
            </TableCell>
            <TableCell>{(!data.isDir) ? humanFileSize(data.size, true) : (<RemoveIcon />)}</TableCell>
            <TableCell>{(!data.isDir) ? (new Date(data.createdAt * 1000)).toLocaleString() : (<RemoveIcon />)}</TableCell>
          </TableRow>
        </>
      );
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
