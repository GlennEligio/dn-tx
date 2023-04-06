import { FormEventHandler, useEffect, useState } from 'react';
import { Col, Container, Row, Image, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import accountApi, { RegisterRequestDto } from '../api/account-api';
import useHttp from '../hooks/useHttp';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const {
    data: registerData,
    error: registerError,
    sendRequest: registerRequest,
    status: registerStatus,
  } = useHttp(false);

  useEffect(() => {
    if (
      registerData !== null &&
      registerError === null &&
      registerStatus === 'completed'
    ) {
      console.log(registerData);
      navigate('/');
    }
  }, [registerData, registerError, registerStatus, navigate]);

  const registerSubmitHandler: FormEventHandler = (event) => {
    event.preventDefault();

    const registerInfo: RegisterRequestDto = {
      username,
      password,
      email,
      fullName,
    };

    const registerRequestConfig = accountApi.register(registerInfo);

    registerRequest(registerRequestConfig);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={8} md={6} lg={4} className="vh-100">
          <div className="d-flex flex-column h-100 py-5">
            <Image src="/dn-tx-logo.png" alt="DN-TX logo" fluid />
            <div>
              <h3 className="text-center">Register</h3>
            </div>
            <Form onSubmit={registerSubmitHandler}>
              <Form.Group className="mb-3" controlId="registerFormUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerFormPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerFormFullName">
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="registerFormEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={fullName}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Register
                </Button>
              </div>
            </Form>
            <div className="mt-auto text-center">
              <Link to="/">Back to home</Link>
            </div>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default Register;
