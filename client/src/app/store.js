import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import web3Reducer from '../common/web3/web3Slice';
import themeReducer from '../common/theme/themeSlice';
import saveDocContractReducer from '../features/contracts/saveDocContractSlice';
import secureFileReducer from '../features/secureFile/secureFileSlice';

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    web3: web3Reducer,
    theme: themeReducer,
    saveDocContract: saveDocContractReducer,
    secureFile: secureFileReducer,
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
