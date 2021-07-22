import { createSlice } from '@reduxjs/toolkit';

export const createContractSlice = (name, initialState, reducers) => {
  return createSlice({
    name,
    initialState: {
      ...initialState,
      contract: null,
    },
    reducers: {
      ...reducers,
      setContract: (state, action) => {
        state.contract = action.payload;
      },
    }
  });
};

export const createContractActions = (contractSlice, Contract) => {
  console.log(contractSlice);
  return {
    loadContract: (web3, networkId) => {
      return async (dispatch) => {
        const deployedNetwork = Contract.networks[networkId];
        const instance = new web3.eth.Contract(
          Contract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        dispatch(contractSlice.actions.setContract(instance));
      }
    },
  };
};
