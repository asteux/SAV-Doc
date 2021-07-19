import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'light',
  },
  reducers: {
    switchToLightMode: (state) => {
      state.mode = 'light';
    },
    switchToDarkMode: (state) => {
      state.mode = 'dark';
    },
  }
});

const themeActions = {
  loadThemeMode: () => {
    return (dispatch) => {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      const switchMode = (isDark)
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
