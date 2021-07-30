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
    currentDirectoryChanged: (state, action) => {
      state.history = [...(state.history.slice(0, state.historyIndex + 1)), action.payload];
      state.historyIndex = state.history.length - 1;
    },
    historyIndexChanged: (state, action) => {
      state.historyIndex = action.payload;
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
  goToParentDirectory: () => {
    return (dispatch, getState) => {
      const { fileManager } = getState();

      const currentDirectory = [...fileManager.history[fileManager.historyIndex]];
      if (1 < currentDirectory.length) {
        currentDirectory.pop();

        dispatch(fileManagerSlice.actions.currentDirectoryChanged(currentDirectory));
      }
    };
  },
  goToPreviousDirectory: () => {
    return (dispatch, getState) => {
      const { fileManager } = getState();

      const newHistoryIndex = Math.max(0, fileManager.historyIndex - 1);
      dispatch(fileManagerSlice.actions.historyIndexChanged(newHistoryIndex));
    };
  },
  goToNextDirectory: () => {
    return (dispatch, getState) => {
      const { fileManager } = getState();

      const newHistoryIndex = Math.min(fileManager.history.length - 1, fileManager.historyIndex + 1);
      dispatch(fileManagerSlice.actions.historyIndexChanged(newHistoryIndex));
    };
  },
};

export const {
  load,
  goToParentDirectory,
  goToPreviousDirectory,
  goToNextDirectory,
} = fileManagerActions;

export default fileManagerSlice.reducer;
