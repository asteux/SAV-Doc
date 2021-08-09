import React, { useMemo } from "react";
import {
  Dialog, DialogContent, DialogTitle, List, ListItem, ListItemText, makeStyles,
  Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography
} from '@material-ui/core';

import { humanFileSize } from "../../utils/file";

const useStyles = makeStyles((theme) => ({
  labelBoolean: {
    padding: theme.spacing(1),
    borderRadius: '8px',
  },
  labelBooleanSuccess: {
    backgroundColor: theme.palette.success.main,
  },
  labelBooleanDanger: {
    backgroundColor: theme.palette.error.main,
  },
}));

const DocumentInformationsDialog = ({ doc, open, handleClose }) => {
  const classes = useStyles();

  const isCertified = useMemo(() => Array.isArray(doc.certifying) && 0 < doc.certifying.length, [doc]);
  const rows = useMemo(() => {
    const rows = [
      { key: 'Identifiant', value: doc.tokenID },
      { key: 'Nom du document', value: doc.filename },
      { key: 'Type de document', value: doc.fileMimeType },
      { key: 'Taille du document', value: humanFileSize(doc.fileSize, true) },
      { key: 'Date de création', value: (new Date(doc.dateAdd * 1000)).toLocaleString() },
      { key: 'est certifié ?', value: (<Typography variant="button" gutterBottom className={`${classes.labelBoolean} ${(isCertified) ? classes.labelBooleanSuccess : classes.labelBooleanDanger}`}>{ (isCertified) ? 'Oui' : 'Non'}</Typography>) },
    ];

    if (isCertified) {
      rows.push(
        { key: 'Certifiants', value: (
          <List>
            {doc.certifying.map((address, index) => (
              <ListItem key={`certifying-${index}-${address}`}>
                <ListItemText className="text-right" primary={address} />
              </ListItem>
            ))}
          </List>
        )}
      );
    }

    return rows;
  }, [classes, doc, isCertified]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="Informations"
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title">Informations</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={`row-${index}-${row.name}`}>
                    <TableCell component="th" scope="row">
                      {row.key}
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentInformationsDialog;
