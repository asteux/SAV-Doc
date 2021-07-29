import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from 'react-router';

import { loadWeb3, updateAccounts } from './common/web3/web3Slice';
import { loadThemeMode } from './common/theme/themeSlice';
import { loadSavDocContract } from './features/contracts/saveDocContractSlice';

import "./App.css";
import Home from "./pages/home/Home";
import DocumentSecure from "./pages/documents/DocumentSecure";
import { createTheme, CssBaseline, ThemeProvider } from "@material-ui/core";

const App = () => {
  const dispatch = useDispatch();

  const web3 = useSelector((state) => state.web3.web3);
  const networkId = useSelector((state) => state.web3.networkId);
  const themeMode = useSelector((state) => state.theme.mode);

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
        <Route exact path="/documents/secure" component={DocumentSecure} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

export default App;
