import React from "react";
import { useSelector } from "react-redux";

import UploadFileForm from './uploadFileForm/UploadFileForm';
import PasswordForm from './passwordForm/PasswordForm';

const SecureFile = () => {
  const originalFile = useSelector((state) => state.secureFile.originalFile);
  const originalPasswordFile = useSelector((state) => state.secureFile.originalPasswordFile);

  if (null === originalFile) {
    return (
      <>
        <UploadFileForm />
      </>
    );
  } else if (null === originalPasswordFile) {
    return (
      <>
        {/* TODO: show file */}
        <PasswordForm />
      </>
    );
  } else {
    return (
      <>TODO: Manage end</>
    );
  }
};

export default SecureFile;
