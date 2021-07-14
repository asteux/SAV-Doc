import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import web3Reducer from '../common/web3/web3Slice';

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    web3: web3Reducer,
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
