import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import web3Reducer from '../common/web3/web3Slice';
import themeReducer from '../common/theme/themeSlice';
import docManagerContractReducer from '../features/contracts/docManagerContractSlice';
import savDocContractReducer from '../features/contracts/savDocContractSlice';
import secureFileReducer from '../features/secureFile/secureFileSlice';
import fileManagerReducer from '../features/FileManager/file-manager-slice';

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    web3: web3Reducer,
    theme: themeReducer,
    docManagerContract: docManagerContractReducer,
    savDocContract: savDocContractReducer,
    secureFile: secureFileReducer,
    fileManager: fileManagerReducer,
  },
  middleware: [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'web3/loadWeb3',
        ],
      }
    }),
    routerMiddleware(history),
  ],
});
