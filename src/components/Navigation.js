import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import logo from '../eware.png';

const Navigation = () => {
  return (
    <Container>
      <Navbar className="my-3" expand="lg" bg="light" variant="light">
        <Navbar.Brand href="#" className="d-flex align-items-center">
          <img
            alt="eware"
            src={logo}
            width="60"
            height="60"
            className="d-inline-block align-top mx-2"
          />
          <span className="fw-bold">EWare ICO</span>
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link href="#about">About</Nav.Link>
          <Nav.Link href="#tokenomics">Tokenomics</Nav.Link>
          <Nav.Link href="#buy">Buy</Nav.Link>
          <Nav.Link href="#team">Team</Nav.Link>
          <Nav.Link href="#faq">FAQ</Nav.Link>
        </Nav>
      </Navbar>
    </Container>
  );
};

export default Navigation;
