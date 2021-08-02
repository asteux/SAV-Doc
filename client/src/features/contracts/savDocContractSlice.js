import { SHA256 } from 'crypto-js';

import { createContractSlice, createContractActions } from './createContractSlice';
import SavDocContract from '../../contracts/SaveDoc.json';
import { decryptWithPassword, decryptWithPrivateKey, encryptWithPublicKey } from '../../utils/encryption';
import { dataURLtoBlob } from '../../utils/file';
import { download } from '../../utils/ipfs';

const createFileMap = (documents) => {
  // fileMap: { [directory: string]: { name: string, directory: string, isDir: bool, size: string }[] }

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

  return fileMap;
};

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
    fetchDocumentsSharedState: {
      data: [],
      fileMap: {},
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    fetchDocumentsCertifiedState: {
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
    requestCertificationDocument: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    acceptCertificationRequest: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    rejectCertificationRequest: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    shareDocument: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    deleteDocument: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
    deleteSharedDocument: {
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
    fetchDocumentsSharedSent: (state) => {
      state.fetchDocumentsSharedState = {
        ...state.fetchDocumentsSharedState,
        status: 'loading',
        error: null,
      };
    },
    fetchDocumentsSharedSucceeded: (state, action) => {
      state.fetchDocumentsSharedState = {
        ...state.fetchDocumentsSharedState,
        data: action.payload.documents,
        fileMap: action.payload.fileMap,
        status: 'succeeded',
        error: null,
      };
    },
    fetchDocumentsSharedFailed: (state, action) => {
      state.fetchDocumentsSharedState = {
        ...state.fetchDocumentsSharedState,
        status: 'failed',
        error: action.payload,
      };
    },
    fetchDocumentsCertifiedSent: (state) => {
      state.fetchDocumentsCertifiedState = {
        ...state.fetchDocumentsCertifiedState,
        status: 'loading',
        error: null,
      };
    },
    fetchDocumentsCertifiedSucceeded: (state, action) => {
      state.fetchDocumentsCertifiedState = {
        ...state.fetchDocumentsCertifiedState,
        data: action.payload.documents,
        fileMap: action.payload.fileMap,
        status: 'succeeded',
        error: null,
      };
    },
    fetchDocumentsCertifiedFailed: (state, action) => {
      state.fetchDocumentsCertifiedState = {
        ...state.fetchDocumentsCertifiedState,
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
    requestCertificationDocumentSent: (state) => {
      state.requestCertificationDocument = {
        ...state.requestCertificationDocument,
        status: 'loading',
        error: null,
      };
    },
    requestCertificationDocumentSucceeded: (state) => {
      state.requestCertificationDocument = {
        ...state.requestCertificationDocument,
        status: 'succeeded',
        error: null,
      };
    },
    requestCertificationDocumentFailed: (state, action) => {
      state.requestCertificationDocument = {
        ...state.requestCertificationDocument,
        status: 'failed',
        error: action.payload,
      };
    },
    acceptCertificationRequestSent: (state) => {
      state.acceptCertificationRequest = {
        ...state.acceptCertificationRequest,
        status: 'loading',
        error: null,
      };
    },
    acceptCertificationRequestSucceeded: (state) => {
      state.acceptCertificationRequest = {
        ...state.acceptCertificationRequest,
        status: 'succeeded',
        error: null,
      };
    },
    acceptCertificationRequestFailed: (state, action) => {
      state.acceptCertificationRequest = {
        ...state.acceptCertificationRequest,
        status: 'failed',
        error: action.payload,
      };
    },
    rejectCertificationRequestSent: (state) => {
      state.rejectCertificationRequest = {
        ...state.rejectCertificationRequest,
        status: 'loading',
        error: null,
      };
    },
    rejectCertificationRequestSucceeded: (state) => {
      state.rejectCertificationRequest = {
        ...state.rejectCertificationRequest,
        status: 'succeeded',
        error: null,
      };
    },
    rejectCertificationRequestFailed: (state, action) => {
      state.rejectCertificationRequest = {
        ...state.rejectCertificationRequest,
        status: 'failed',
        error: action.payload,
      };
    },
    shareDocumentSent: (state) => {
      state.shareDocument = {
        ...state.shareDocument,
        status: 'loading',
        error: null,
      };
    },
    shareDocumentSucceeded: (state) => {
      state.shareDocument = {
        ...state.shareDocument,
        status: 'succeeded',
        error: null,
      };
    },
    shareDocumentFailed: (state, action) => {
      state.shareDocument = {
        ...state.shareDocument,
        status: 'failed',
        error: action.payload,
      };
    },
    deleteDocumentSent: (state) => {
      state.deleteDocument = {
        ...state.deleteDocument,
        status: 'loading',
        error: null,
      };
    },
    deleteDocumentSucceeded: (state) => {
      state.deleteDocument = {
        ...state.deleteDocument,
        status: 'succeeded',
        error: null,
      };
    },
    deleteDocumentFailed: (state, action) => {
      state.deleteDocument = {
        ...state.deleteDocument,
        status: 'failed',
        error: action.payload,
      };
    },
    deleteSharedDocumentSent: (state) => {
      state.deleteSharedDocument = {
        ...state.deleteSharedDocument,
        status: 'loading',
        error: null,
      };
    },
    deleteSharedDocumentSucceeded: (state) => {
      state.deleteSharedDocument = {
        ...state.deleteSharedDocument,
        status: 'succeeded',
        error: null,
      };
    },
    deleteSharedDocumentFailed: (state, action) => {
      state.deleteSharedDocument = {
        ...state.deleteSharedDocument,
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
      const { web3, savDocContract } = getState();

      dispatch(savDocContractSlice.actions.fetchDocumentsOriginalsSent());

      try {
        const documents = await savDocContract.contract.methods
          .viewMyDocs()
          .call({ from: web3.accounts[0] })
        ;

        const fileMap = createFileMap(documents);

        // root: string[]
        // fileMap: { [directory: string]: { name: string, directory: string, isDir: bool, size: string }[] }

        dispatch(savDocContractSlice.actions.fetchDocumentsOriginalsSucceeded({ documents, fileMap }));
      } catch (error) {
        dispatch(savDocContractSlice.actions.fetchDocumentsOriginalsFailed(error));
      }
    }
  },
  fetchDocumentsShared: () => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      dispatch(savDocContractSlice.actions.fetchDocumentsSharedSent());

      try {
        const documents = await savDocContract.contract.methods
          .viewMyCopyDocs()
          .call({ from: web3.accounts[0] })
        ;

        const fileMap = createFileMap(documents);

        dispatch(savDocContractSlice.actions.fetchDocumentsSharedSucceeded({ documents, fileMap }));
      } catch (error) {
        dispatch(savDocContractSlice.actions.fetchDocumentsSharedFailed(error));
      }
    }
  },
  fetchDocumentsCertified: () => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      dispatch(savDocContractSlice.actions.fetchDocumentsCertifiedSent());

      try {
        const documents = await savDocContract.contract.methods
          .viewDocCertified()
          .call({ from: web3.accounts[0] })
        ;

        const fileMap = createFileMap(documents);

        dispatch(savDocContractSlice.actions.fetchDocumentsCertifiedSucceeded({ documents, fileMap }));
      } catch (error) {
        dispatch(savDocContractSlice.actions.fetchDocumentsCertifiedFailed(error));
      }
    }
  },
  decryptFile: (doc) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      dispatch(savDocContractSlice.actions.unencryptFileStart(doc.tokenID));

      try {
        const isOriginal = 0 === doc.typeNft || "0" === doc.typeNft;

        let tokenURI;
        if (isOriginal) {
          tokenURI = await savDocContract.contract.methods
            .getTokenURI(doc.tokenID)
            .call({ from: web3.accounts[0] })
          ;
        } else {
          tokenURI = doc.tokenURI;
        }

        const ipfsCid = await decryptWithPrivateKey(tokenURI, web3.accounts[0]);
        const encryptedFile = await download(ipfsCid);

        if (isOriginal) {
          const encryptedPasswordWithMaster = await decryptWithPrivateKey(doc.passwordEncrypted, web3.accounts[0]);
          const password = decryptWithPassword(encryptedPasswordWithMaster, savDocContract.passwordMaster);
          const decryptedFile = decryptWithPassword(encryptedFile, password);
          const file = dataURLtoBlob(decryptedFile);

          dispatch(savDocContractSlice.actions.unencryptFileSucceeded({ tokenID: doc.tokenID, file }));
        } else {
          const decryptedFile = await decryptWithPrivateKey(encryptedFile, web3.accounts[0]);
          const file = dataURLtoBlob(decryptedFile);

          dispatch(savDocContractSlice.actions.unencryptFileSucceeded({ tokenID: doc.tokenID, file }));
        }

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
  requestCertification: (tokenID, tokenURI, certifying) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .requestCertification(tokenID, tokenURI, certifying)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.requestCertificationDocumentSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.requestCertificationDocumentSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.requestCertificationDocumentFailed(error));
          }
        })
      ;
    }
  },
  acceptCertificationRequest: (tokenID, hashNFT, keepCopyDoc) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .acceptCertificationRequest(tokenID, hashNFT, keepCopyDoc)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.acceptCertificationRequestSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.acceptCertificationRequestSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.acceptCertificationRequestFailed(error));
          }
        })
      ;
    }
  },
  rejectCertificationRequest: (tokenID) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .rejectCertificationRequest(tokenID)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.rejectCertificationRequestSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.rejectCertificationRequestSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.rejectCertificationRequestFailed(error));
          }
        })
      ;
    }
  },
  shareDocument: (tokenID, to, tokenURI) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .shareDoc(tokenID, to, tokenURI)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.shareDocumentSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.shareDocumentSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.shareDocumentFailed(error));
          }
        })
      ;
    }
  },
  deleteDocument: (tokenID, forTransfer) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .delMyDocument(tokenID, forTransfer)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.deleteDocumentSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.deleteDocumentSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.deleteDocumentFailed(error));
          }
        })
      ;
    }
  },
  deleteSharedDocument: (tokenID) => {
    return async (dispatch, getState) => {
      const { web3, savDocContract } = getState();

      savDocContract.contract.methods
        .delCopyDocShared(tokenID)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(savDocContractSlice.actions.deleteSharedDocumentSent());
        })
        .once('receipt', () => {
          dispatch(savDocContractSlice.actions.deleteSharedDocumentSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(savDocContractSlice.actions.deleteSharedDocumentFailed(error));
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
  fetchDocumentsShared,
  fetchDocumentsCertified,
  decryptFile,
  secureDocument,
  requestCertification,
  acceptCertificationRequest,
  rejectCertificationRequest,
  shareDocument,
  deleteDocument,
  deleteSharedDocument,
} = savDocContractActions;

export default savDocContractSlice.reducer;
