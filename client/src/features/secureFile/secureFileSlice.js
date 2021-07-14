import { createSlice } from '@reduxjs/toolkit';

const secureFileSlice = createSlice({
  name: 'secureFile',
  initialState: {
    originalFile: null,
    originalPasswordFile: null,
  },
  reducers: {
    setOriginalFile: (state, action) => {
      state.originalFile = action.payload;
    },
    setOriginalPasswordFile: (state, action) => {
      state.originalPasswordFile = action.payload;
    },
  }
});

const secureFileActions = {
  setOriginalFile: (file) => {
    return (dispatch) => {
      return dispatch(secureFileSlice.actions.setOriginalFile(file));
    };
  },
  setOriginalPasswordFile: (password) => {
    return (dispatch) => {
      return dispatch(secureFileSlice.actions.setOriginalPasswordFile(password));
    };
  },
};

export const {
  setOriginalFile,
  setOriginalPasswordFile,
} = secureFileActions;

export default secureFileSlice.reducer;
