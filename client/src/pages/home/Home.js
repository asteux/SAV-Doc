import React from "react";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { Button, Col, Container, Image, Nav, Navbar, Row } from "react-bootstrap";

import ToggleThemeModeButton from '../../common/theme/ToggleThemeModeButton';

const Home = () => {
  const themeMode = useSelector((state) => state.theme.mode);
  const themeContrast = useSelector((state) => state.theme.contrast);

  return (
    <>
      <Navbar bg={themeMode} variant={themeMode} expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand href="#presentation">Sav-Doc</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link className={ `text-${themeContrast}` } href="#presentation">Présentation</Nav.Link>
              <Nav.Link className={ `text-${themeContrast}` } href="#securisation">Sécurisation</Nav.Link>
              <Nav.Link className={ `text-${themeContrast}` } href="#partage">Partage</Nav.Link>
              <Nav.Link className={ `text-${themeContrast}` } href="#certification">Certification</Nav.Link>
            </Nav>

            <Nav>
              <Nav.Item className="ml-2">
                <ToggleThemeModeButton />
              </Nav.Item>

              <Nav.Item className="ml-2">
                <Link to="/documents">
                  <Button variant="primary">Accéder à mes documents</Button>
                </Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>
        <div id="presentation" className={ `bg-${themeMode} text-${themeContrast}` }>
          <Container>
            <div className="position-relative overflow-hidden text-center">
              <div className="p-lg-5 my-5">
                <h1 className="display-4 font-weight-normal">SAV-Doc</h1>
                <p className="lead font-weight-normal">Texte introduction SAV-Doc</p>
                <Link to="/documents">
                  <Button variant="primary" size="lg">Accéder à mes documents</Button>
                </Link>
              </div>
            </div>
          </Container>
        </div>

        <div id="securisation" className={ `bg-${themeMode} text-${themeContrast} py-5` }>
          <Container>
            <Row>
              <Col xs={12} md={7} className="order-last order-md-first">
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src="" alt="coffre fort" rounded />
                </div>
              </Col>

              <Col xs={12} md={5}>
                <div>
                  <h2>Sécuriser</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque suscipit nisl euismod mauris interdum, quis vehicula est faucibus. Aliquam vitae sollicitudin sapien. Pellentesque sed varius urna. Cras quam nisl, dapibus quis gravida sed, pretium sed felis. Cras congue ultrices nisl vel faucibus. Nam at facilisis mi. Duis aliquet, leo nec auctor volutpat, risus magna blandit dolor, sed venenatis magna ex cursus mi. Sed eu nibh sit amet tortor convallis viverra. Pellentesque placerat egestas viverra. Nulla magna odio, cursus vitae fermentum eget, mattis id ex. Cras orci quam, placerat a tellus sit amet, imperdiet varius quam. Phasellus aliquam nisi ut sagittis pulvinar. Sed suscipit molestie turpis, id cursus ipsum faucibus at.</p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <div id="partage" className={ `bg-${themeMode} text-${themeContrast} py-5` }>
          <Container>
            <Row>
              <Col xs={12} md={5}>
                <div>
                  <h2>Partager</h2>
                  <p>Nunc ornare consectetur enim, quis viverra tellus iaculis ut. Phasellus sodales nisl a arcu tempor pharetra. Integer feugiat tellus sagittis lacus accumsan suscipit. Fusce accumsan risus eu enim maximus varius. Quisque varius gravida dapibus. Morbi eget lorem et arcu ornare congue vitae id massa. Integer in porttitor enim. Ut posuere vulputate lorem, sit amet volutpat mauris elementum quis. Aliquam non lectus placerat, cursus urna ac, blandit nisl. Donec ac justo varius, vehicula quam nec, scelerisque nulla. Mauris nec nunc at urna auctor accumsan id sed nisl. Aenean ullamcorper porttitor lectus in imperdiet. In varius leo mollis massa auctor lobortis ac non ipsum. Maecenas dignissim feugiat malesuada.</p>
                </div>
              </Col>

              <Col xs={12} md={7}>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src="" alt="partage" rounded />
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <div id="certification" className={ `bg-${themeMode} text-${themeContrast} py-5` }>
          <Container>
            <Row>
              <Col xs={12} md={7} className="order-last order-md-first">
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Image src="" alt="document certifié" rounded />
                </div>
              </Col>

              <Col xs={12} md={5}>
                <div>
                  <h2>Certifier</h2>
                  <p>Praesent vel sapien non ipsum interdum aliquam in sed libero. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at felis nec sem sollicitudin viverra. Praesent a volutpat nisi. Vivamus sem tortor, accumsan a orci vel, sollicitudin consectetur leo. Sed lobortis ultricies purus, ut pharetra massa scelerisque lacinia. Nulla facilisi. Pellentesque nulla ante, dignissim scelerisque massa non, vestibulum pellentesque magna. Praesent tristique tincidunt vestibulum. Sed at faucibus velit. Donec rutrum augue in volutpat sollicitudin. Nam molestie purus sagittis quam lacinia, in lobortis sapien suscipit. Nullam sodales, sapien vel auctor luctus, elit justo elementum orci, ornare finibus tellus libero vel neque. Aenean placerat nibh eget fringilla maximus. Nunc posuere purus ac sodales volutpat. Quisque pellentesque, turpis nec porttitor efficitur, neque elit maximus lacus, ut hendrerit nibh tortor a sem.</p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <div className={ `bg-${themeMode} text-${themeContrast} py-5` }>
          <Container id="presentation">
            <div className="position-relative overflow-hidden text-center">
              <Link to="/documents">
                <Button variant="primary" size="lg">Accéder à mes documents</Button>
              </Link>
            </div>
          </Container>
        </div>
      </main>
    </>
  );
};

export default Home;
