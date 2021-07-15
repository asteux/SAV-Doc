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
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const switchMode = (isDark)
        ? themeSlice.actions.switchToDarkMode
        : themeSlice.actions.switchToLightMode
      ;

      document.body.classList.add((isDark) ? 'bg-dark' : 'bg-light');

      return dispatch(switchMode());
    };
  },
  switchToLightMode: () => {
    return (dispatch) => {
      document.body.classList.remove('bg-dark');
      document.body.classList.add('bg-light');

      return dispatch(themeSlice.actions.switchToLightMode());
    };
  },
  switchToDarkMode: () => {
    return (dispatch) => {
      document.body.classList.remove('bg-light');
      document.body.classList.add('bg-dark');

      return dispatch(themeSlice.actions.switchToDarkMode());
    };
  },
};

export const { loadThemeMode, switchToLightMode, switchToDarkMode } = themeActions;

export default themeSlice.reducer;
