import { createSlice } from '@reduxjs/toolkit';

import { secureDocument } from '../contracts/saveDocContractSlice';
import { encryptWithPassword, encryptWithPublicKey, getEncryptionPublicKey } from '../../utils/encryption';
import { getFileType, readFileAsDataURL } from '../../utils/file';
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
    reset: (state) => {
      state.activeStep = 0;
      state.loadingMessage = null;
      state.originalFile = null;
      state.encryptedFile = null;
      state.originalPasswordFile = null;
      state.encryptedPasswordFile = null;
      state.originalIpfsCid = null;
      state.encryptedIpfsCid = null;
    }
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
  sendTransactionToSecure: () => {
    return async (dispatch, getState) => {
      const { secureFile } = getState();

      const tokenURI = secureFile.encryptedIpfsCid;
      const directory = '/';
      const fileName = secureFile.originalFile.name.replace(/^.*?([^\\\/]*)$/, '$1')
      const fileMimeType = (await getFileType(secureFile.originalFile)).mime ?? secureFile.originalFile.type ?? 'application/octet-stream';
      const fileSize = secureFile.originalFile.size;

      dispatch(secureDocument(tokenURI, directory, fileName, fileMimeType, fileSize));
    };
  },
  reset: () => {
    return async (dispatch) => {
      dispatch(secureFileSlice.actions.reset());
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
  sendTransactionToSecure,
  reset,
} = secureFileActions;

export default secureFileSlice.reducer;
