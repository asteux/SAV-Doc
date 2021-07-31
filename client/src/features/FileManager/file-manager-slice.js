import { createSlice } from '@reduxjs/toolkit';

const fileManagerSlice = createSlice({
  name: 'fileManager',
  initialState: {
    root: null,
    fileMap: {},
    history: [[""]],
    historyIndex: 0,
    action: '', // null | 'addFile'
    querySearch: '',
    viewMode: 'grid', // 'grid' | 'list'
    sortBy: 'name', // 'name' | 'size' | 'createdAt'
    sortReversedOrder: false,
    fileToShow: null,
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
    actionChanged: (state, action) => {
      state.action = action.payload;
    },
    querySearchChanged: (state, action) => {
      state.querySearch = action.payload;
    },
    viewModeChanged: (state, action) => {
      state.viewMode = action.payload;
    },
    sortByChanged: (state, action) => {
      state.sortBy = action.payload;
    },
    sortReversedOrderToggled: (state) => {
      state.sortReversedOrder = !state.sortReversedOrder;
    },
    fileToShowChanged: (state, action) => {
      state.fileToShow = action.payload;
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
  setCurrentDirectory: (currentDirectory) => {
    return (dispatch) => {
      dispatch(fileManagerSlice.actions.currentDirectoryChanged(currentDirectory));
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
  setAction: (action) => {
    return (dispatch) => {
      dispatch(fileManagerSlice.actions.actionChanged(action));
    };
  },
  setSearchQuery: (query) => {
    return (dispatch) => {
      dispatch(fileManagerSlice.actions.querySearchChanged(query));
    };
  },
  setViewMode: (viewMode) => {
    return (dispatch, getState) => {
      dispatch(fileManagerSlice.actions.viewModeChanged(viewMode));
    };
  },
  setSortBy: (sortBy) => {
    return (dispatch, getState) => {
      dispatch(fileManagerSlice.actions.sortByChanged(sortBy));
    };
  },
  toggleSortReversedOrder: () => {
    return (dispatch, getState) => {
      dispatch(fileManagerSlice.actions.sortReversedOrderToggled());
    };
  },
  showFile: (fileData) => {
    return (dispatch) => {
      dispatch(fileManagerSlice.actions.fileToShowChanged(fileData));
    };
  },
  hideFile: () => {
    return (dispatch) => {
      dispatch(fileManagerSlice.actions.fileToShowChanged(null));
    };
  },
};

export const {
  load,
  setCurrentDirectory,
  goToParentDirectory,
  goToPreviousDirectory,
  goToNextDirectory,
  setAction,
  setSearchQuery,
  setViewMode,
  setSortBy,
  toggleSortReversedOrder,
  showFile,
  hideFile,
} = fileManagerActions;

export default fileManagerSlice.reducer;
