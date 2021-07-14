import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from 'react-router';

import { loadWeb3, updateAccounts } from './common/web3/web3Slice';

import "./App.css";

const App = () => {
  const dispatch = useDispatch();

  const web3 = useSelector((state) => state.web3.web3);

  useEffect(() => {
    // Load Web3
    dispatch(loadWeb3());
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

  if (!web3) {
    return (
      <div>Loading Web3, accounts, and contract...</div>
    );
  }

  return (
    <Switch>
      <Route exact path="/" render={() => (<div>Home</div>)} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default App;
