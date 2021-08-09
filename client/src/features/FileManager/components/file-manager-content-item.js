import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListItemIcon, makeStyles, Menu, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
import InfoIcon from '@material-ui/icons/Info';
import RemoveIcon from '@material-ui/icons/Remove';
import SendIcon from '@material-ui/icons/Send';
import ShareIcon from '@material-ui/icons/Share';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  deleteFile, manageCertificationRequest, setCurrentDirectory,
  requestCertificationFile, shareFile, showFile, showInformations, transferFile
} from "../file-manager-slice";
import { humanFileSize } from "../../../utils/file";

const initialMenuState = {
  mouseX: null,
  mouseY: null,
};

export const useStyles = makeStyles((theme) => ({
  link: {
    cursor: 'pointer',
  },
  filename: {
    overflowWrap: 'break-word',
  },
  icon: {
    width: '100%',
    height: 'auto',
  },
  certifiedIcon: {
    color: theme.palette.success.main,
  },
  certifiedIconGrid: {
    position: 'absolute',
    bottom: '2px',
    right: '16px',
  },
  certifiedIconList: {
    marginBottom: '3px',
  },
}));

const FileManagerContentItem = ({ data, icon }) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const [menuState, setMenuState] = useState(initialMenuState);
  const enabledFileActions = useSelector((state => state.fileManager.enabledFileActions));
  const viewMode = useSelector((state => state.fileManager.viewMode));

  const isCertified = useMemo(() => !!data.data && !!data.data.certifying && Array.isArray(data.data.certifying) && 0 < data.data.certifying.length, [data]);

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

  const handleRequestShowInformations = () => {
    dispatch(showInformations(data.data));
    handleCloseMenu();
  };

  const handleRequestCertificationFile = () => {
    dispatch(requestCertificationFile(data.data));
    handleCloseMenu();
  };

  const handleManageCertificationRequest = () => {
    dispatch(manageCertificationRequest(data.data));
    handleCloseMenu();
  };

  const handleShareFile = () => {
    dispatch(shareFile(data.data));
    handleCloseMenu();
  };

  const handleTransferFile = () => {
    dispatch(transferFile(data.data));
    handleCloseMenu();
  };

  const handleDeleteFile = () => {
    dispatch(deleteFile(data.data));
    handleCloseMenu();
  };

  const handleDoubleClick = (event) => {
    if (data.isDir) {
      dispatch(setCurrentDirectory([...data.directory, data.name]));
    } else {
      dispatch(showFile(data.data));
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
      {(enabledFileActions.includes('showInformations'))
        ? (
        <MenuItem onClick={handleRequestShowInformations}>
          <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Afficher les informations</Typography>
        </MenuItem>
        )
        : null
      }

      {(enabledFileActions.includes('requestCertification'))
        ? (
        <MenuItem onClick={handleRequestCertificationFile}>
          <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
            <VerifiedUserIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Demander une certification</Typography>
        </MenuItem>
        )
        : null
      }

      {(enabledFileActions.includes('manageCertificationRequest'))
        ? (
        <MenuItem onClick={handleManageCertificationRequest}>
          <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
            <VerifiedUserIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Gérer la certification du document</Typography>
        </MenuItem>
        )
        : null
      }

      {(enabledFileActions.includes('share'))
        ? (
        <MenuItem onClick={handleShareFile}>
          <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Partager</Typography>
        </MenuItem>
        )
        : null
      }

      {(enabledFileActions.includes('transfer'))
        ? (
        <MenuItem onClick={handleTransferFile}>
          <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Transférer</Typography>
        </MenuItem>
        )
        : null
      }

      {(enabledFileActions.includes('delete'))
        ? (
          <MenuItem onClick={handleDeleteFile}>
            <ListItemIcon className="mr-2" style={{ minWidth: 'initial' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Supprimer</Typography>
          </MenuItem>
        )
        : null
      }
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
              <Typography className={`${classes.filename} ${classes.link}`} onDoubleClick={handleDoubleClick} onContextMenu={handleOpenMenu}>
                {(isCertified)
                  ? <VerifiedUserIcon className={`${classes.certifiedIcon} ${classes.certifiedIconList}`} />
                  : <></>
                }
                {data.name}
              </Typography>
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
          <div className={`${classes.filename} ${classes.link}`} onDoubleClick={handleDoubleClick} onContextMenu={handleOpenMenu}>
            <div className="position-relative">
              {icon}
              {(isCertified)
                ? <VerifiedUserIcon fontSize="large" className={`${classes.certifiedIcon} ${classes.certifiedIconGrid}`} />
                : <></>
              }
            </div>
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
