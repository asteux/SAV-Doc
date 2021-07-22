import { createSlice } from '@reduxjs/toolkit';

const storage = window.localStorage;

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'light',
  },
  reducers: {
    switchToLightMode: (state) => {
      state.mode = 'light';
      storage.setItem('theme.mode', state.mode);
    },
    switchToDarkMode: (state) => {
      state.mode = 'dark';
      storage.setItem('theme.mode', state.mode);
    },
  }
});

const themeActions = {
  loadThemeMode: () => {
    return (dispatch) => {
      const themeMode = storage.getItem('theme.mode');

      let isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (themeMode) {
        isDark = 'dark' === themeMode;
      }

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
