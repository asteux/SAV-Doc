import React, { useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField
} from "@material-ui/core";

import { subscribe } from "../contracts/savDocContractSlice";
import { useDispatch, useSelector } from "react-redux";
import { getEncryptionPublicKey } from "../../utils/encryption";

const RegistrationDialog = ({ open, handleClose }) => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState(null);
  const accounts = useSelector((state) => state.web3.accounts);
  const subscriptionState = useSelector((state) => state.savDocContract.subscription);

  const validate = (formData) => {
    let errors = {};
    let isValid = true;

    if (typeof formData.get('password') !== "undefined" && typeof formData.get('confirm_password') !== "undefined") {
      if (formData.get('password') !== formData.get('confirm_password')) {
        isValid = false;
        errors["password"] = "Les mots de passe ne correspondent pas.";
      }
    }

    if (!formData.get('confirm_password')) {
      isValid = false;
      errors["confirm_password"] = "Veuillez entrer votre mot de passe de confirmation.";
    }

    if (!formData.get('password')) {
      isValid = false;
      errors["password"] = "Veuillez entrer votre mot de passe.";
    } else if (20 >= formData.get('password').length) {
      isValid = false;
      errors["password"] = "Le mot de passe doit avoir au moins 20 caractères.";
    }

    setErrors(errors);

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    if (validate(formData)) {
      const publicKey = await getEncryptionPublicKey(accounts[0]);
      dispatch(subscribe(formData.get('name'), publicKey, formData.get('password')));
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="Registration"
      >
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour s'inscrire, vous devez définir un mot de passe maître. Ce mot de passe sera utilisé pour chiffrer tous vos documents.
            Nous avons aussi besoin de votre clé publique.
          </DialogContentText>

          <form id="registration-form" onSubmit={handleSubmit}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom"
              type="text"
              fullWidth
            />

            <TextField
              margin="dense"
              name="password"
              label="Mot de passe"
              type="password"
              fullWidth
              {
                ...{
                  error: errors && errors.password,
                  helperText: (errors && errors.password) ? errors.password : null,
                }
              }
            />

            <TextField
              margin="dense"
              name="confirm_password"
              label="Confirmation du mot de passe"
              type="password"
              fullWidth
              {
                ...{
                  error: errors && errors.password,
                  helperText: (errors && errors.password) ? errors.password : null,
                }
              }
            />
          </form>
        </DialogContent>

        <DialogActions>
          {('idle' === subscriptionState.status || 'failed' === subscriptionState.status)
            ? (
              <>
                <Button onClick={handleClose} color="primary">
                  Annuler
                </Button>

                <Button type="submit" form="registration-form" color="primary">
                  S'inscrire
                </Button>
              </>
              )
            : (
              <></>
            )
          }
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegistrationDialog;
