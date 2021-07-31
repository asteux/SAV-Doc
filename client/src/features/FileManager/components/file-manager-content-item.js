import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListItemIcon, makeStyles, Menu, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
import RemoveIcon from '@material-ui/icons/Remove';
import DeleteIcon from '@material-ui/icons/Delete';

import { deleteFile, setCurrentDirectory, showFile } from "../file-manager-slice";
import { humanFileSize } from "../../../utils/file";

const initialMenuState = {
  mouseX: null,
  mouseY: null,
};

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

  const [menuState, setMenuState] = useState(initialMenuState);
  const viewMode = useSelector((state => state.fileManager.viewMode));

  const handleOpenMenu = (event) => {
    event.preventDefault();
    setMenuState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseMenu = () => {
    setMenuState(initialMenuState);
  };

  const handleDeleteFile = () => {
    dispatch(deleteFile(data));
    handleCloseMenu();
  };

  const handleDoubleClick = (event) => {
    if (data.isDir) {
      dispatch(setCurrentDirectory([...data.directory, data.name]));
    } else {
      dispatch(showFile(data));
    }
  };

  const contextMenu = (
    <Menu
      keepMounted
      open={menuState.mouseY !== null}
      onClose={handleCloseMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        menuState.mouseY !== null && menuState.mouseX !== null
          ? { top: menuState.mouseY, left: menuState.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={handleDeleteFile}>
        <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">Supprimer</Typography>
      </MenuItem>
    </Menu>
  );

  let content = <></>;
  switch (viewMode) {
    case 'list':
      content = (
        <>
          <TableRow key={data.name}>
            <TableCell component="th" padding="checkbox" scope="row">{icon}</TableCell>
            <TableCell>
              <Typography className={classes.link} onDoubleClick={handleDoubleClick} onContextMenu={handleOpenMenu}>{data.name}</Typography>
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
          <div className={classes.link} onDoubleClick={handleDoubleClick} onContextMenu={handleOpenMenu}>
            {icon}
            <Typography className="text-center">{data.name}</Typography>
          </div>
        </>
      );
      break;
  }

  return (
    <>
      {content}
      {contextMenu}
    </>
  )
};

export default FileManagerContentItem;
