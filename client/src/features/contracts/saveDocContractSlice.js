import { createContractSlice, createContractActions } from './createContractSlice';
import SavDocContract from '../../contracts/SaveMyDoc.json';

const saveDocContractSlice = createContractSlice(
  'savDocContract',
  {
    secureDocument: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
  },
  {
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
  secureDocument: (tokenURI, directory, fileName, fileMimeType, fileSize, password, hashFile) => {
    return async (dispatch, getState) => {
      const { web3, saveDocContract } = getState();

      saveDocContract.contract.methods
        .secureDocument(fileName, tokenURI, fileMimeType, fileSize, directory, password, hashFile)
        .send({ from: web3.accounts[0] })
        .once('transactionHash', () => {
          dispatch(saveDocContractSlice.actions.secureDocumentSent());
        })
        .once('receipt', () => {
          dispatch(saveDocContractSlice.actions.secureDocumentSucceeded());
        })
        .once('error', (error) => {
          if (!error.code || 4001 !== error.code) {
            dispatch(saveDocContractSlice.actions.secureDocumentFailed(error));
          }
        })
      ;
    }
  },
  ...createContractActions(saveDocContractSlice, SavDocContract),
};

export const { loadContract: loadSavDocContract, secureDocument } = savDocContractActions;

export default saveDocContractSlice.reducer;
