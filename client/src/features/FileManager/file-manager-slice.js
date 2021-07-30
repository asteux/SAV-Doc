import { createSlice } from '@reduxjs/toolkit';

const fileManagerSlice = createSlice({
  name: 'fileManager',
  initialState: {
    root: null,
    fileMap: {},
    history: [[""]],
    historyIndex: 0,
  },
  reducers: {
    isLoaded: (state, action) => {
      state.root = action.payload.root;
      state.fileMap = action.payload.fileMap;
      state.history = [[state.root]];
      state.historyIndex = 0;
    },
  },
});

const fileManagerActions = {
  load: (root, fileMap) => {
    // root: string[]
    // fileMap: { [directory: string]: { name: string, directory: string, isDir: bool, size: string }[] }
    return (dispatch) => {
      dispatch(fileManagerSlice.actions.isLoaded({ root, fileMap }));
    };
  },
};

export const {
  load,
} = fileManagerActions;

export default fileManagerSlice.reducer;
