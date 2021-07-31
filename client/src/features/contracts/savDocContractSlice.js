import { createContractSlice, createContractActions } from './createContractSlice';
import SavDocContract from '../../contracts/SaveMyDoc.json';
import { decryptWithPassword, decryptWithPrivateKey } from '../../utils/encryption';
import { dataURLtoBlob } from '../../utils/file';
import { download } from '../../utils/ipfs';

const savDocContractSlice = createContractSlice(
  'savDocContract',
  {
    subscription: {
      data: null,
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    userInformations: {
      data: null,
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    userEncryptedPasswordMaster: {
      data: null,
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    decryptedFiles: {},
    secureDocument: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
  },
  {
    subscriptionSent: (state) => {
      state.subscription = {
        ...state.subscription,
        status: 'loading',
        error: null,
      };
    },
    subscriptionSucceeded: (state) => {
      state.subscription = {
        ...state.subscription,
        status: 'succeeded',
        error: null,
      };
    },
    subscriptionFailed: (state, action) => {
      state.subscription = {
        ...state.subscription,
        status: 'failed',
        error: action.payload,
      };
    },
    fetchUserInformationsSent: (state) => {
      state.userInformations = {
        ...state.userInformations,
        status: 'loading',
        error: null,
      };
    },
    fetchUserInformationsSucceeded: (state, action) => {
      state.userInformations = {
        ...state.userInformations,
        data: action.payload,
        status: 'succeeded',
        error: null,
      };
    },
    fetchUserInformationsFailed: (state, action) => {
      state.userInformations = {
        ...state.userInformations,
        status: 'failed',
        error: action.payload,
      };
    },
    fetchUserPasswordMasterSent: (state) => {
      state.userEncryptedPasswordMaster = {
        ...state.userEncryptedPasswordMaster,
        status: 'loading',
        error: null,
      };
    },
    fetchUserPasswordMasterSucceeded: (state, action) => {
      state.userEncryptedPasswordMaster = {
        ...state.userEncryptedPasswordMaster,
        data: action.payload,
        status: 'succeeded',
        error: null,
      };
    },
    fetchUserPasswordMasterFailed: (state, action) => {
      state.userEncryptedPasswordMaster = {
        ...state.userEncryptedPasswordMaster,
        status: 'failed',
        error: action.payload,
      };
    },
    unencryptFileStart: (state, action) => {
      const decryptedFiles = {
        ...state.decryptedFiles,
      };

      decryptedFiles[action.payload.tokenID] = {
        data: null,
        status: 'idle',
        error: null
      }

      state.decryptedFiles = decryptedFiles;
    },
    unencryptFileSucceeded: (state, action) => {
      const decryptedFiles = {
        ...state.decryptedFiles,
      };

      decryptedFiles[action.payload.tokenID] = {
        data: action.payload.file,
        status: 'succeeded',
        error: null,
      }

      state.decryptedFiles = decryptedFiles;
    },
    unencryptFileFailed: (state, action) => {
      const decryptedFiles = {
        ...state.decryptedFiles,
      };

      decryptedFiles[action.payload.tokenID] = {
        data: null,
        status: 'failed',
        error: action.payload,
      }

      state.decryptedFiles = decryptedFiles;
    },
    secureDocumentSent: (state) => {
      state.secureDocument = {
        ...state.secureDocument,
        status: 'loading',
        error: null,
      };
    },
    secureDocumentSucceeded: (state) => {
      state.secureDocument = {
        ...state.secureDocument,
        status: 'succeeded',
        error: null,
      };
    },
    secureDocumentFailed: (state, action) => {
      state.secureDocument = {
        ...state.secureDocument,
        status: 'failed',
        error: action.payload,
      };
    },
  },
);

const savDocContractActions = {
  subscribe: (name, publicKey, encryptedPasswordMaster) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .subscribe(name, publicKey, encryptedPasswordMaster)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.subscriptionSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.subscriptionSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.subscriptionFailed(error));
          }
        })
      ;
    }
  },
  fetchUserAndPassword: () => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      dispatch(savDocContractSlice.actions.fetchUserInformationsSent());

      try {
        const user = await savDocContract.contract.methods
          .viewMyProfil()
          .call({ from: web3.accounts[0] })
        ;

        dispatch(savDocContractSlice.actions.fetchUserInformationsSucceeded(user));

        dispatch(savDocContractSlice.actions.fetchUserPasswordMasterSent());

        try {
          const encryptedPasswordMaster = await savDocContract.contract.methods
            .getMyPasswordMaster()
            .call({ from: web3.accounts[0] })
          ;

          dispatch(savDocContractSlice.actions.fetchUserPasswordMasterSucceeded(encryptedPasswordMaster));
        } catch (error) {
          dispatch(savDocContractSlice.actions.fetchUserPasswordMasterFailed(error));
        }
      } catch (error) {
        dispatch(savDocContractSlice.actions.fetchUserInformationsFailed(error));
      }
    }
  },
  decryptedFile: (doc, password) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      dispatch(savDocContractSlice.actions.unencryptFileStart(doc.tokenID));

      try {
        const tokenURI = await savDocContract.contract.methods
          .getTokenURI(doc.tokenID)
          .call({ from: web3.accounts[0] })
        ;

        const ipfsCid = await decryptWithPrivateKey(tokenURI, web3.accounts[0]);
        const encryptedFile = await download(ipfsCid);
        const decryptedFile = decryptWithPassword(encryptedFile, password);
        const file = dataURLtoBlob(decryptedFile);

        dispatch(savDocContractSlice.actions.unencryptFileSucceeded({ tokenID: doc.tokenID, file }));
      } catch (error) {
        dispatch(savDocContractSlice.actions.unencryptFileFailed(error));
      }
    }
  },
  secureDocument: (tokenURI, directory, fileName, fileMimeType, fileSize, password, hashFile) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .secureDocument(fileName, tokenURI, fileMimeType, fileSize, directory, password, hashFile)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.secureDocumentSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.secureDocumentSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.secureDocumentFailed(error));
          }
        })
      ;
    }
  },
  ...createContractActions(savDocContractSlice, SavDocContract),
};

export const {
  loadContract: loadSavDocContract,
  subscribe,
  fetchUserAndPassword,
  decryptedFile,
  secureDocument,
} = savDocContractActions;

export default savDocContractSlice.reducer;
