import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function DeleteTransactionSuccess() {
  return (
    <Container>
      <Row className="vh-100">
        <Col />
        <Col
          xs={8}
          md={6}
          lg={4}
          className="d-flex flex-column justify-content-center"
        >
          <div className="text-center">
            <h1>Success!</h1>
          </div>
          <div className="text-center">
            <p>Transaction was successfully deleted</p>
          </div>
          <div className="text-center">
            <Link to="/">Go back to Home</Link>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default DeleteTransactionSuccess;
