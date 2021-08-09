import { createSlice } from '@reduxjs/toolkit';

import { acceptTransferDocument } from '../contracts/savDocContractSlice';
import { encryptWithPassword, encryptWithPublicKey, getEncryptionPublicKey } from '../../utils/encryption';
import { readFileAsDataURL } from '../../utils/file';
import { storeBlob } from '../../utils/ipfs';
import { generatePassword } from '../../utils/password';

const acceptTransferSlice = createSlice({
  name: 'acceptTransfer',
  initialState: {
    activeStep: 0,
    loadingMessage: null,
    doc: null,
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
    docChanged: (state, action) => {
      state.activeStep = 0;
      state.loadingMessage = null;
      state.doc = null;
      state.originalFile = null;
      state.encryptedFile = null;
      state.originalPasswordFile = null;
      state.encryptedPasswordFile = null;
      state.originalIpfsCid = null;
      state.encryptedIpfsCid = null;

      state.doc = action.payload;
    },
    setOriginalFile: (state, action) => {
      state.originalFile = action.payload;
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
      state.doc = null;
      state.originalFile = null;
      state.encryptedFile = null;
      state.originalPasswordFile = null;
      state.encryptedPasswordFile = null;
      state.originalIpfsCid = null;
      state.encryptedIpfsCid = null;
    }
  }
});

const acceptTransferActions = {
  previousStep: () => {
    return (dispatch) => {
      return dispatch(acceptTransferSlice.actions.previousStep());
    };
  },
  nextStep: () => {
    return (dispatch) => {
      return dispatch(acceptTransferSlice.actions.nextStep());
    };
  },
  setDoc: (doc) => {
    return (dispatch) => {
      dispatch(acceptTransferSlice.actions.docChanged(doc));
    };
  },
  setOriginalFile: (file) => {
    return (dispatch) => {
      return dispatch(acceptTransferSlice.actions.setOriginalFile(file));
    };
  },
  encryptAndUploadFile: () => {
    return async (dispatch, getState) => {
      const { acceptTransfer, savDocContract, web3 } = getState();

      const file = acceptTransfer.originalFile;
      const encryptionPublicKey = await getEncryptionPublicKey(web3.accounts[0]);
      const password = generatePassword(32);
      const passwordMaster = savDocContract.passwordMaster

      dispatch(acceptTransferSlice.actions.showLoading('Chiffrement du document en cours'));

      try {
        const fileAsDataUrl = await readFileAsDataURL(file);
        const encryptedFile = encryptWithPassword(fileAsDataUrl, password);
        dispatch(acceptTransferSlice.actions.setEncryptedFile(encryptedFile));

        dispatch(acceptTransferSlice.actions.showLoading('Upload du document en cours'));

        try {
          const cid = await storeBlob(encryptedFile);

          dispatch(acceptTransferSlice.actions.setOriginalIpfsCid(cid));

          dispatch(acceptTransferSlice.actions.showLoading('Chiffrement des informations en cours'));

          try {
            const encryptedIpfsCid = encryptWithPublicKey(cid, encryptionPublicKey);
            dispatch(acceptTransferSlice.actions.setEncryptedIpfsCid(encryptedIpfsCid));

            const encryptedPasswordFile = encryptWithPublicKey(encryptWithPassword(password, passwordMaster), encryptionPublicKey);
            dispatch(acceptTransferSlice.actions.setEncryptedPasswordFile(encryptedPasswordFile));
          } catch (error) {
          } finally {
            dispatch(acceptTransferSlice.actions.hideLoading());
          }
        } catch (error) {
        } finally {
          dispatch(acceptTransferSlice.actions.hideLoading());
        }
      } catch (error) {
      } finally {
        dispatch(acceptTransferSlice.actions.hideLoading());
      }
    };
  },
  sendTransaction: () => {
    return async (dispatch, getState) => {
      const { acceptTransfer } = getState();

      const tokenID = acceptTransfer.doc.tokenID;
      const tokenURI = acceptTransfer.encryptedIpfsCid;
      const encryptedPassword = acceptTransfer.encryptedPasswordFile;

      dispatch(acceptTransferDocument(tokenID, tokenURI, encryptedPassword));
    };
  },
  reset: () => {
    return async (dispatch) => {
      dispatch(acceptTransferSlice.actions.reset());
    };
  },
};

export const {
  previousStep,
  nextStep,
  setDoc,
  setOriginalFile,
  encryptAndUploadFile,
  sendTransaction,
  reset,
} = acceptTransferActions;

export default acceptTransferSlice.reducer;
