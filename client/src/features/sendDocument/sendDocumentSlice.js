import { createSlice } from '@reduxjs/toolkit';

import { shareDocument } from '../contracts/savDocContractSlice';
import { encryptWithPublicKey } from '../../utils/encryption';
import { readFileAsDataURL } from '../../utils/file';
import { storeBlob } from '../../utils/ipfs';

const sendDocumentSlice = createSlice({
  name: 'sendDocument',
  initialState: {
    activeStep: 0,
    loadingMessage: null,
    doc: null,
    recipientAddress: null,
    recipientUser: null,
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
        // state.encryptedFile = null;
        // state.encryptedPasswordFile = null;
        if (2 > state.activeStep) {
          // state.originalPasswordFile = null;
          if (1 > state.activeStep) {
            state.recipientUser = null;
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
    docChanged: (state, action) => {
      state.activeStep = 0;
      state.loadingMessage = null;
      state.doc = null;
      state.recipientAddress = null;
      state.recipientUser = null;
      state.originalFile = null;
      state.encryptedFile = null;
      state.originalPasswordFile = null;
      state.encryptedPasswordFile = null;
      state.originalIpfsCid = null;
      state.encryptedIpfsCid = null;

      state.doc = action.payload;
    },
    recipientAddressChanged: (state, action) => {
      state.recipientAddress = action.payload;
    },
    recipientUserChanged: (state, action) => {
      state.recipientUser = action.payload;
    },
    setOriginalFile: (state, action) => {
      state.originalFile = action.payload;
    },
    // setOriginalPasswordFile: (state, action) => {
    //   state.originalPasswordFile = action.payload;
    // },
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
      state.recipientAddress = null;
      state.recipientUser = null;
      state.originalFile = null;
      state.encryptedFile = null;
      state.originalPasswordFile = null;
      state.encryptedPasswordFile = null;
      state.originalIpfsCid = null;
      state.encryptedIpfsCid = null;
    }
  }
});

const sendDocumentActions = {
  previousStep: () => {
    return (dispatch) => {
      return dispatch(sendDocumentSlice.actions.previousStep());
    };
  },
  nextStep: () => {
    return (dispatch) => {
      return dispatch(sendDocumentSlice.actions.nextStep());
    };
  },
  setDoc: (doc) => {
    return (dispatch) => {
      dispatch(sendDocumentSlice.actions.docChanged(doc));
    };
  },
  setRecipientUser: (address, user) => {
    return (dispatch) => {
      dispatch(sendDocumentSlice.actions.recipientAddressChanged(address));
      dispatch(sendDocumentSlice.actions.recipientUserChanged(user));
    };
  },
  setOriginalFile: (file) => {
    return (dispatch) => {
      return dispatch(sendDocumentSlice.actions.setOriginalFile(file));
    };
  },
  encryptAndUploadFile: () => {
    return async (dispatch, getState) => {
      const { sendDocument } = getState();

      const file = sendDocument.originalFile;
      const recipientUser = sendDocument.recipientUser;

      const encryptionPublicKey = recipientUser.publicKey;

      dispatch(sendDocumentSlice.actions.showLoading('Chiffrement du document en cours'));

      try {
        const fileAsDataUrl = await readFileAsDataURL(file);
        const encryptedFile = encryptWithPublicKey(fileAsDataUrl, encryptionPublicKey);
        dispatch(sendDocumentSlice.actions.setEncryptedFile(encryptedFile));

        dispatch(sendDocumentSlice.actions.showLoading('Upload du document en cours'));

        try {
          const cid = await storeBlob(encryptedFile);

          dispatch(sendDocumentSlice.actions.setOriginalIpfsCid(cid));

          dispatch(sendDocumentSlice.actions.showLoading('Chiffrement des informations en cours'));

          try {
            const encryptedIpfsCid = encryptWithPublicKey(cid, encryptionPublicKey);
            dispatch(sendDocumentSlice.actions.setEncryptedIpfsCid(encryptedIpfsCid));

            dispatch(sendDocumentSlice.actions.setEncryptedPasswordFile(""));
          } catch (error) {
          } finally {
            dispatch(sendDocumentSlice.actions.hideLoading());
          }
        } catch (error) {
        } finally {
          dispatch(sendDocumentSlice.actions.hideLoading());
        }
      } catch (error) {
      } finally {
        dispatch(sendDocumentSlice.actions.hideLoading());
      }
    };
  },
  sendTransaction: () => {
    return async (dispatch, getState) => {
      const { sendDocument } = getState();

      const tokenID = sendDocument.doc.tokenID;
      const recipientAddress = sendDocument.recipientAddress;
      const tokenURI = sendDocument.encryptedIpfsCid;

      dispatch(shareDocument(tokenID, recipientAddress, tokenURI));
    };
  },
  reset: () => {
    return async (dispatch) => {
      dispatch(sendDocumentSlice.actions.reset());
    };
  },
};

export const {
  previousStep,
  nextStep,
  setDoc,
  setRecipientUser,
  setOriginalFile,
  encryptAndUploadFile,
  sendTransaction,
  reset,
} = sendDocumentActions;

export default sendDocumentSlice.reducer;
