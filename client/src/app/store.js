import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import web3Reducer from '../common/web3/web3Slice';
import themeReducer from '../common/theme/themeSlice';
import savDocContractReducer from '../features/contracts/savDocContractSlice';
import secureFileReducer from '../features/secureFile/secureFileSlice';
import fileManagerReducer from '../features/FileManager/file-manager-slice';
import sendDocumentReducer from '../features/sendDocument/sendDocumentSlice';
import manageCertificationRequestReducer from '../features/manageCertificationRequest/manageCertificationRequestSlice';

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    web3: web3Reducer,
    theme: themeReducer,
    savDocContract: savDocContractReducer,
    secureFile: secureFileReducer,
    fileManager: fileManagerReducer,
    sendDocument: sendDocumentReducer,
    manageCertificationRequest: manageCertificationRequestReducer,
  },
  middleware: [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'web3/loadWeb3',
          'savDocContract/setContract',
          'savDocContract/unencryptFileSucceeded',
          'secureFile/setOriginalFile',
          'sendDocument/setOriginalFile',
          'manageCertificationRequest/setOriginalFile',
        ],
        ignoredPaths: [
          'web3.web3',
          'savDocContract.contract',
          'savDocContract.decryptedFiles',
          'secureFile.originalFile',
          'sendDocument.originalFile',
          'manageCertificationRequest.originalFile',
        ],
      }
    }),
    routerMiddleware(history),
  ],
});
