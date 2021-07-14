import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'light',
    contrast: 'dark',
  },
  reducers: {
    switchToLightMode: (state) => {
      state.mode = 'light';
      state.contrast = 'dark';
    },
    switchToDarkMode: (state) => {
      state.mode = 'dark';
      state.contrast = 'light';
    },
  }
});

const themeActions = {
  loadThemeMode: () => {
    return (dispatch) => {
      const switchMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? themeSlice.actions.switchToDarkMode
        : themeSlice.actions.switchToLightMode
      ;

      return dispatch(switchMode());
    };
  },
  switchToLightMode: () => {
    return (dispatch) => {
      return dispatch(themeSlice.actions.switchToLightMode());
    };
  },
  switchToDarkMode: () => {
    return (dispatch) => {
      return dispatch(themeSlice.actions.switchToDarkMode());
    };
  },
};

export const { loadThemeMode, switchToLightMode, switchToDarkMode } = themeActions;

export default themeSlice.reducer;
