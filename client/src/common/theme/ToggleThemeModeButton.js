import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton } from '@material-ui/core';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import NightsStayIcon from '@material-ui/icons/NightsStay';

import { switchToLightMode, switchToDarkMode } from './themeSlice';

const ToggleThemeModeButton = () => {
  const dispatch = useDispatch();

  const themeMode = useSelector((state) => state.theme.mode);

  switch (themeMode) {
    case 'light':
      return (
        <>
          <IconButton onClick={(event) => { dispatch(switchToDarkMode()) }}>
            <NightsStayIcon />
          </IconButton>
        </>
      );

    case 'dark':
      return (
        <>
          <IconButton onClick={(event) => { dispatch(switchToLightMode()) }}>
            <WbSunnyIcon />
          </IconButton>
        </>
      );

    default:
      return (<></>);
  }
};

export default ToggleThemeModeButton;
