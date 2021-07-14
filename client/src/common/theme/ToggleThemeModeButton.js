import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import { Sun, Moon } from 'react-bootstrap-icons';

import { switchToLightMode, switchToDarkMode } from './themeSlice';

const ToggleThemeModeButton = () => {
  const dispatch = useDispatch();

  const themeMode = useSelector((state) => state.theme.mode);
  const themeContrast = useSelector((state) => state.theme.contrast);

  switch (themeMode) {
    case 'light':
      return (
        <>
          <Button className={ `text-${themeContrast}` } variant={ `outline-${themeMode}` } onClick={(event) => { dispatch(switchToDarkMode()) }}>
            <Sun />
          </Button>
        </>
      );

    case 'dark':
      return (
        <>
          <Button className={ `text-${themeContrast}` } variant={ `outline-${themeMode}` } onClick={(event) => { dispatch(switchToLightMode()) }}>
            <Moon />
          </Button>
        </>
      );

    default:
      return (<></>);
  }
};

export default ToggleThemeModeButton;
