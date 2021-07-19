import { createSlice } from '@reduxjs/toolkit';

import { encryptWithPassword, encryptWithPublicKey, getEncryptionPublicKey } from '../../utils/encryption';
import { readFileAsDataURL } from '../../utils/file';
import { storeBlob } from '../../utils/ipfs';

const secureFileSlice = createSlice({
  name: 'secureFile',
  initialState: {
    activeStep: 0,
    loadingMessage: null,
    originalFile: null,
    encryptedFile: null,
    originalPasswordFile: null,
    encryptedPasswordFile: null,
    originalIpfsCid: null,
    encryptedIpfsCid: null,
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
    showLoading: (state, action) => {
      state.loadingMessage = (action.payload) ? action.payload : '';
    },
    hideLoading: (state) => {
      state.loadingMessage = null;
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
    setOriginalIpfsCid: (state, action) => {
      state.originalIpfsCid = action.payload;
    },
    setEncryptedIpfsCid: (state, action) => {
      state.encryptedIpfsCid = action.payload;
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
      dispatch(secureFileSlice.actions.showLoading('Chiffrement du document en cours'));

      try {
        const fileAsDataUrl = await readFileAsDataURL(file);
        const encryptedFile = encryptWithPassword(fileAsDataUrl, password);
        dispatch(secureFileSlice.actions.setEncryptedFile(encryptedFile));
      } catch (error) {
      } finally {
        dispatch(secureFileSlice.actions.hideLoading());
      }
    };
  },
  uploadFile: (encryptedFile) => {
    return async (dispatch) => {
      dispatch(secureFileSlice.actions.showLoading('Upload du document en cours'));

      try {
        const cid = await storeBlob(encryptedFile);

        dispatch(secureFileSlice.actions.setOriginalIpfsCid(cid));
      } catch (error) {
      } finally {
        dispatch(secureFileSlice.actions.hideLoading());
      }
    };
  },
  encryptIpfsCidAndPassword: (ipfsCid, password, account) => {
    return async (dispatch) => {
      dispatch(secureFileSlice.actions.showLoading('Chiffrement des informations en cours'));

      try {
        const encryptionPublicKey = await getEncryptionPublicKey(account);

        const encryptedIpfsCid = encryptWithPublicKey(ipfsCid, encryptionPublicKey);
        dispatch(secureFileSlice.actions.setEncryptedIpfsCid(encryptedIpfsCid));

        const encryptedPasswordFile = encryptWithPublicKey(password, encryptionPublicKey);
        dispatch(secureFileSlice.actions.setEncryptedPasswordFile(encryptedPasswordFile));
      } catch (error) {
      } finally {
        dispatch(secureFileSlice.actions.hideLoading());
      }
    };
  },
  reset: () => {
    return async (dispatch) => {
      dispatch(secureFileSlice.actions.setActiveStep(0));
      dispatch(secureFileSlice.actions.setOriginalFile(null));
      dispatch(secureFileSlice.actions.setOriginalPasswordFile(null));
      dispatch(secureFileSlice.actions.setEncryptedFile(null));
      dispatch(secureFileSlice.actions.setEncryptedPasswordFile(null));
      dispatch(secureFileSlice.actions.setEncryptedIpfsCid(null));
    };
  },
};

export const {
  previousStep,
  nextStep,
  setOriginalFile,
  setOriginalPasswordFile,
  encryptFile,
  uploadFile,
  encryptIpfsCidAndPassword,
  reset,
} = secureFileActions;

export default secureFileSlice.reducer;
