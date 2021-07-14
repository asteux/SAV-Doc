import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form } from 'react-bootstrap';

import { setOriginalPasswordFile } from '../secureFileSlice';

const PasswordForm = () => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState(null);

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
    } else if (12 > formData.get('password').length) {
      isValid = false;
      errors["password"] = "Le mot de passe doit avoir au moins 12 caractères.";
    }

    setErrors(errors);

    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    if (validate(formData)) {
      dispatch(setOriginalPasswordFile(formData.get('password')));
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Mot de passe</Form.Label>
        <Form.Control type="password" name="password" />
        {
          (errors && errors.password)
            ? <Form.Text className="text-danger" type="invalid">{errors.password}</Form.Text>
            : <></>
        }
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirmation du mot de passe</Form.Label>
        <Form.Control type="password" name="confirm_password" />
        {
          (errors && errors.confirm_password)
            ? <Form.Text className="text-danger" type="invalid">{errors.confirm_password}</Form.Text>
            : <></>
        }
      </Form.Group>

      <Button variant="primary" type="submit">Utiliser ce mot de passe</Button>
    </Form>
  );
};

export default PasswordForm;
