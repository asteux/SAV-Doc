import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import web3Reducer from '../common/web3/web3Slice';
import themeReducer from '../common/theme/themeSlice';

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    web3: web3Reducer,
    theme: themeReducer,
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
