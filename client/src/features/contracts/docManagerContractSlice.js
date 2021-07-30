import { createContractSlice, createContractActions } from './createContractSlice';
import DocManagerContract from '../../contracts/DocManager.json';

const docManagerContractSlice = createContractSlice(
  'docManagerContract',
  {
    fetchDocumentsOriginalsState: {
      data: [],
      fileMap: {},
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
    },
  },
  {
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
  },
);

const docManagerContractActions = {
  fetchDocumentsOriginals: () => {
    return async (dispatch, getState) => {
      const { docManagerContract } = getState();

      dispatch(docManagerContractSlice.actions.fetchDocumentsOriginalsSent());

      try {
        const documents = await docManagerContract.contract.methods
          .getDocs()
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

        dispatch(docManagerContractSlice.actions.fetchDocumentsOriginalsSucceeded({ documents, fileMap }));
      } catch (error) {
        dispatch(docManagerContractSlice.actions.fetchDocumentsOriginalsFailed(error));
      }
    }
  },
  ...createContractActions(docManagerContractSlice, DocManagerContract),
};

export const {
  loadContract: loadDocManagerContract,
  fetchDocumentsOriginals,
} = docManagerContractActions;

export default docManagerContractSlice.reducer;
