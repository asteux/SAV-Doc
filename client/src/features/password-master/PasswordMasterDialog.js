import React, { useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField
} from "@material-ui/core";
import { SHA256 } from "crypto-js";

import { definePasswordMaster } from "../contracts/savDocContractSlice";
import { useDispatch, useSelector } from "react-redux";
import { decryptWithPrivateKey } from "../../utils/encryption";

const PasswordMasterDialog = ({ open, handleClose }) => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState(null);
  const accounts = useSelector((state) => state.web3.accounts);
  const userEncryptedPasswordMasterState = useSelector((state) => state.savDocContract.userEncryptedPasswordMaster);

  const validate = async(formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.get('password')) {
      isValid = false;
      errors["password"] = "Veuillez entrer votre mot de passe.";
    } else if (20 >= formData.get('password').length) {
      isValid = false;
      errors["password"] = "Le mot de passe doit avoir au moins 20 caractères.";
    } else if (await decryptWithPrivateKey(userEncryptedPasswordMasterState.data, accounts[0]) !== SHA256(formData.get('password')).toString()) {
      isValid = false;
      errors["password"] = "Mot de passe incorrect";
    }

    setErrors(errors);

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    validate(formData).then((isValid) => {
      if (isValid) {
        dispatch(definePasswordMaster(formData.get('password')));
      }
    });
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="Registration"
      >
        <DialogTitle id="form-dialog-title">Mot de passe maître</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour accèder à vos document, veuillez dévérouiller votre coffre fort.
          </DialogContentText>

          <form id="password-master-form" onSubmit={handleSubmit}>
            <TextField
              autoFocus
              margin="dense"
              name="password"
              label="Mot de passe"
              type="password"
              fullWidth
              {
                ...{
                  error: !!errors && !!errors.password,
                  helperText: (!!errors && !!errors.password) ? errors.password : null,
                }
              }
            />
          </form>
        </DialogContent>

        <DialogActions>
          <>
            <Button onClick={handleClose} color="primary">
              Annuler
            </Button>

            <Button type="submit" form="password-master-form" color="primary">
              Dévérouiller
            </Button>
          </>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PasswordMasterDialog;
