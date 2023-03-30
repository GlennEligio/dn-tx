import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container>
      <Row>
        <Col />
        <Col className="vh-100">
          <div className="d-flex align-items-center justify-content-center flex-column py-5">
            <h1>404</h1>
            <h3>Oops... page not found</h3>
            <Link to="/">GO TO HOME</Link>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default NotFound;
