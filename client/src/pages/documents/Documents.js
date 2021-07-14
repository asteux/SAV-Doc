import React from "react";
import { useSelector } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';

const Documents = () => {
  const themeMode = useSelector((state) => state.theme.mode);

  return (
    <>
      <Navbar bg={themeMode} variant={themeMode} sticky="top">
        <Container fluid>
          <Navbar.Brand href="#home">Sav-Doc</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
            </Nav>

            <Nav>
              <Nav.Item className="ml-2">
                <ToggleThemeModeButton />
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="py-3">
        <Container>
        </Container>
      </main>
    </>
  );
};

export default Documents;
