import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DialogActions, DialogContent, DialogContentText, TextField } from "@material-ui/core";

import { setRecipientUser } from '../sendDocumentSlice';

const EthereumAddressForm = () => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState(null);
  const web3 = useSelector(state => state.web3.web3);
  const savDocContract = useSelector(state => state.savDocContract.contract);

  const validate = async (formData) => {
    let errors = {};
    let isValid = true;

    if (!formData.get('address')) {
      isValid = false;
      errors["address"] = "Veuillez entrer une addresse Ethereum.";
    } else if (!web3.utils.isAddress(formData.get('address'))) {
      isValid = false;
      errors["address"] = "L'addresse Ethererum est incorrecte";
    } else {
      try {
        await savDocContract.methods.viewProfil(formData.get('address')).call();
      } catch (error) {
        isValid = false;
        errors["address"] = "L'addresse Ethererum n'est pas associé à un utilisateur de SAVDoc";
      }
    }

    setErrors(errors);

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    validate(formData).then(async (isValid) => {
      if (isValid) {
        const recipientAddress = await savDocContract.methods.viewProfil(formData.get('address')).call();
        dispatch(setRecipientUser(formData.get('address'), recipientAddress));
      }
    });
  }

  return (
    <>
      <DialogContent>
        <DialogContentText>
          Pour accèder à vos document, veuillez dévérouiller votre coffre fort.
        </DialogContentText>

        <form id="address-ethereum-form" onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            name="address"
            label="Addresse Ethereum du destinataire"
            type="text"
            fullWidth
            {
              ...{
                error: !!errors && !!errors.address,
                helperText: (!!errors && !!errors.address) ? errors.address : null,
              }
            }
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button type="submit" form="address-ethereum-form" color="primary">
           Choisir cet addresse
        </Button>
      </DialogActions>
    </>
  );
};

export default EthereumAddressForm;
