import { createSlice } from '@reduxjs/toolkit';

import { encryptWithPassword, encryptWithPublicKey } from '../../utils/encryption';
import { readFileAsDataURL } from '../../utils/file';

const secureFileSlice = createSlice({
  name: 'secureFile',
  initialState: {
    originalFile: null,
    encryptedFile: null,
    originalPasswordFile: null,
    encryptedPasswordFile: null,
  },
  reducers: {
    setOriginalFile: (state, action) => {
      state.originalFile = action.payload;
    },
    setOriginalPasswordFile: (state, action) => {
      state.originalPasswordFile = action.payload;
    },
    setEncryptedFile: (state, action) => {
      state.encryptedFile = action.payload;
    },
    setEncryptedPasswordFile: (state, action) => {
      state.encryptedPasswordFile = action.payload;
    },
  }
});

const secureFileActions = {
  setOriginalFile: (file) => {
    return (dispatch) => {
      return dispatch(secureFileSlice.actions.setOriginalFile(file));
    };
  },
  setOriginalPasswordFile: (password) => {
    return (dispatch) => {
      return dispatch(secureFileSlice.actions.setOriginalPasswordFile(password));
    };
  },
  encryptFile: (file, password) => {
    return async (dispatch) => {
      const fileAsDataUrl = await readFileAsDataURL(file);
      const encryptedFile = encryptWithPassword(fileAsDataUrl, password);
      dispatch(secureFileSlice.actions.setEncryptedFile(encryptedFile));
    };
  },
  encryptPassword: (password, account) => {
    return async (dispatch) => {
      const encryptedPasswordFile = await encryptWithPublicKey(password, account);
      dispatch(secureFileSlice.actions.setEncryptedPasswordFile(encryptedPasswordFile));
    };
  },
};

export const {
  setOriginalFile,
  setOriginalPasswordFile,
  encryptFile,
  encryptPassword,
} = secureFileActions;

export default secureFileSlice.reducer;
