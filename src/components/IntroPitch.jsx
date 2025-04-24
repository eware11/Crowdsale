import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';

const IntroPitch = () => {
  return (
    <Container>
      <Row className="justify-content-center text-center my-5">
        <Col md={8}>
          <h1 className="mb-4"><strong>Become a Founding Member of the EWARE Ecosystem</strong></h1>
          <p>
            The EWare Token is the cornerstone of a powerful and expanding blockchain ecosystem. 
            This is your opportunity to get in early on a project designed to fuel a wide range of decentralized applications and solutions built for the future.
            As the ecosystem grows, early investors will gain priority positioning in a network driven by innovation, utility, and long-term vision.
            Don’t just watch the future unfold—help shape it.
          </p>
          <div className="d-flex justify-content-center">
            <Button variant="primary" size="lg" href="#whitelistRequest">
              Request Whitelist Access
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center text-center my-5">
        <Col md={8}>
          <h5>Find Us:</h5>
          <p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">Github</a> | 
            <a href="https://x.com" target="_blank" rel="noopener noreferrer"> X</a> | 
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer"> Discord</a>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default IntroPitch;
