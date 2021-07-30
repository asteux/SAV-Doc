import { createContractSlice, createContractActions } from './createContractSlice';
import SavDocContract from '../../contracts/SaveMyDoc.json';
import { decryptWithPassword, decryptWithPrivateKey } from '../../utils/encryption';
import { dataURLtoBlob } from '../../utils/file';
import { download } from '../../utils/ipfs';

const savDocContractSlice = createContractSlice(
  'savDocContract',
  {
    decryptedFiles: {},
    secureDocument: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
  },
  {
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
  decryptedFile,
  secureDocument,
} = savDocContractActions;

export default savDocContractSlice.reducer;
