import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from 'react-router';

import { loadWeb3, updateAccounts } from './common/web3/web3Slice';
import { loadThemeMode } from './common/theme/themeSlice';
import { loadSavDocContract, fetchUserAndPassword } from './features/contracts/savDocContractSlice';

import "./App.css";
import Home from "./pages/home/Home";
import DocumentSecure from "./pages/documents/DocumentSecure";
import DocumentsViewer from "./pages/documents/DocumentsViewer";
import { createTheme, CssBaseline, ThemeProvider } from "@material-ui/core";

const App = () => {
  const dispatch = useDispatch();

  const web3 = useSelector((state) => state.web3.web3);
  const networkId = useSelector((state) => state.web3.networkId);
  const accounts = useSelector((state) => state.web3.accounts);
  const themeMode = useSelector((state) => state.theme.mode);

  const savDocContract = useSelector((state) => state.savDocContract.contract);
  const userInformationsState = useSelector((state) => state.savDocContract.userInformations);
  const passwordMaster = useSelector((state) => state.savDocContract.passwordMaster);

  const registered = useMemo(() => {
    return ('idle' === userInformationsState.status || 'loading' === userInformationsState.status) ? true : !!userInformationsState.data;
  }, [userInformationsState]);
  const logged = useMemo(() => {
    return !!registered && !!passwordMaster;
  }, [registered, passwordMaster]);

  useEffect(() => {
    // Load Web3
    dispatch(loadWeb3());
    dispatch(loadThemeMode());
  }, [dispatch]);

  useEffect(() => {
    if (window.ethereum && web3) {
      // Manage Metamask Events
      window.ethereum.on('accountsChanged', async (newAccounts) => {
        const accounts = await web3.eth.getAccounts();
        dispatch(updateAccounts(accounts));
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }
  }, [dispatch, web3]);

  useEffect(() => {
    if (web3 && networkId) {
      // Load Contracts
      dispatch(loadSavDocContract(web3, networkId));
    }
  }, [dispatch, web3, networkId]);

  useEffect(() => {
    if (savDocContract && accounts) {
      dispatch(fetchUserAndPassword());
    }
  }, [dispatch, savDocContract, accounts]);

  const theme = createTheme({
    palette: {
      type: themeMode,
    }
  });

  if (!web3) {
    return (
      <div>Loading Web3, accounts, and contract...</div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/documents" render={(props) => (
            logged === true
                ? <DocumentsViewer />
                : <Redirect to='/' />
        )} />
        <Route exact path="/documents/secure" render={(props) => (
            logged === true
                ? <DocumentSecure />
                : <Redirect to='/' />
        )} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

export default App;
