import { createSlice } from '@reduxjs/toolkit';

import getWeb3 from "../../getWeb3";

const web3Slice = createSlice({
  name: 'web3',
  initialState: {
    web3: null,
    accounts: [],
  },
  reducers: {
    loadWeb3: (state, action) => {
      state.web3 = action.payload.web3;
      state.accounts = action.payload.accounts;
    },
    updateAccounts: (state, action) => {
      state.accounts = action.payload;
    }
  }
});

const web3Actions = {
  loadWeb3: () => {
    return async (dispatch) => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        dispatch(web3Slice.actions.loadWeb3({ web3, accounts }));
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );

        throw error;
      }
    }
  },
  updateAccounts: (accounts) => {
    return (dispatch) => {
      return dispatch(web3Slice.actions.updateAccounts(accounts));
    };
  },
};

export const { loadWeb3, updateAccounts } = web3Actions;

export default web3Slice.reducer;
