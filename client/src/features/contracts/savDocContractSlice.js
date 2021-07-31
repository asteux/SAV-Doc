import { SHA256 } from 'crypto-js';

import { createContractSlice, createContractActions } from './createContractSlice';
import SavDocContract from '../../contracts/SaveDoc.json';
import { decryptWithPassword, decryptWithPrivateKey, encryptWithPublicKey } from '../../utils/encryption';
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
    passwordMaster: null,
    fetchDocumentsOriginalsState: {
      data: [],
      fileMap: {},
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
    passwordMasterDefined: (state, action) => {
      state.passwordMaster = action.payload;
    },
    fetchDocumentsOriginalsSent: (state) => {
      state.fetchDocumentsOriginalsState = {
        ...state.fetchDocumentsOriginalsState,
        status: 'loading',
        error: null,
      };
    },
    fetchDocumentsOriginalsSucceeded: (state, action) => {
      state.fetchDocumentsOriginalsState = {
        ...state.fetchDocumentsOriginalsState,
        data: action.payload.documents,
        fileMap: action.payload.fileMap,
        status: 'succeeded',
        error: null,
      };
    },
    fetchDocumentsOriginalsFailed: (state, action) => {
      state.fetchDocumentsOriginalsState = {
        ...state.fetchDocumentsOriginalsState,
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
  subscribe: (name, publicKey, passwordMaster) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      const encryptedPasswordMaster = encryptWithPublicKey(SHA256(passwordMaster).toString(), publicKey);

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
  definePasswordMaster: (password) => {
    return async (dispatch, getState) => {
      dispatch(savDocContractSlice.actions.passwordMasterDefined(password));
    }
  },
  fetchDocumentsOriginals: () => {
    return async (dispatch, getState) => {
      const { savDocContract } = getState();

      dispatch(savDocContractSlice.actions.fetchDocumentsOriginalsSent());

      try {
        const documents = await savDocContract.contract.methods
          .viewMyDocs()
          .call()
        ;

        const fileMap = {};

        for (const doc of documents) {
          let directory = doc.filePath.split('/')
          if ('/' === doc.filePath) {
            directory = [''];
          }

          for (let i = 0; i < directory.length; i++) {
            const key = directory.slice(0, i + 1).join('/');
            if (!Object.hasOwnProperty.call(fileMap, key)) {
              fileMap[key] = [];
            }

            if (directory.length - 1 !== i) {
              fileMap[key].push({
                name: directory[i + 1],
                directory: directory.slice(0, i + 1),
                isDir: true,
                size: 0,
                createdAt: null,
                data: null,
              });
            }
          }

          fileMap[directory.join('/')].push({
            name: doc.filename,
            directory: directory,
            isDir: false,
            size: doc.fileSize,
            createdAt: parseInt(doc.dateAdd),
            data: doc,
          });
        }

        // root: string[]
        // fileMap: { [directory: string]: { name: string, directory: string, isDir: bool, size: string }[] }

        dispatch(savDocContractSlice.actions.fetchDocumentsOriginalsSucceeded({ documents, fileMap }));
      } catch (error) {
        dispatch(savDocContractSlice.actions.fetchDocumentsOriginalsFailed(error));
      }
    }
  },
  decryptedFile: (doc) => {
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
        const encryptedPasswordWithMaster = await decryptWithPrivateKey(doc.passwordEncrypted, web3.accounts[0]);
        const password = decryptWithPassword(encryptedPasswordWithMaster, savDocContract.passwordMaster);
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
  definePasswordMaster,
  fetchDocumentsOriginals,
  decryptedFile,
  secureDocument,
} = savDocContractActions;

export default savDocContractSlice.reducer;
