import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
  },
  middleware: [
    ...getDefaultMiddleware(),
    routerMiddleware(history),
  ],
});
