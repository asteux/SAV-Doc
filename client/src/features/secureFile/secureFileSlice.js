import { createSlice } from '@reduxjs/toolkit';

import { encryptWithPassword, encryptWithPublicKey } from '../../utils/encryption';
import { readFileAsDataURL } from '../../utils/file';

const secureFileSlice = createSlice({
  name: 'secureFile',
  initialState: {
    activeStep: 0,
    originalFile: null,
    encryptedFile: null,
    originalPasswordFile: null,
    encryptedPasswordFile: null,
  },
  reducers: {
    previousStep: (state) => {
      state.activeStep--;

      if (3 > state.activeStep) {
        state.encryptedFile = null;
        state.encryptedPasswordFile = null;
        if (2 > state.activeStep) {
          state.originalPasswordFile = null;
          if (1 > state.activeStep) {
            state.originalFile = null;
          }
        }
      }
    },
    nextStep: (state) => {
      state.activeStep++;
    },
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
  previousStep: () => {
    return (dispatch) => {
      return dispatch(secureFileSlice.actions.previousStep());
    };
  },
  nextStep: () => {
    return (dispatch) => {
      return dispatch(secureFileSlice.actions.nextStep());
    };
  },
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
  reset: () => {
    return async (dispatch) => {
      dispatch(secureFileSlice.actions.setActiveStep(0));
      dispatch(secureFileSlice.actions.setOriginalFile(null));
      dispatch(secureFileSlice.actions.setOriginalPasswordFile(null));
      dispatch(secureFileSlice.actions.setEncryptedFile(null));
      dispatch(secureFileSlice.actions.setEncryptedPasswordFile(null));
    };
  },
};

export const {
  previousStep,
  nextStep,
  setOriginalFile,
  setOriginalPasswordFile,
  encryptFile,
  encryptPassword,
  reset,
} = secureFileActions;

export default secureFileSlice.reducer;
