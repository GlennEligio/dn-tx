import React, { FormEventHandler, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Image, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AccountApi, {
  LoginRequestDto,
  LoginResponseDto,
} from '../api/account-api';
import useHttp from '../hooks/useHttp';
import { authActions } from '../store/authSlice';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: loginData,
    error: loginError,
    sendRequest: loginRequest,
    status: loginStatus,
  } = useHttp<LoginResponseDto>(false);

  useEffect(() => {
    if (
      loginData !== null &&
      loginError === null &&
      loginStatus === 'completed'
    ) {
      dispatch(
        authActions.saveAuth({
          username: loginData.username,
          accessToken: loginData.accessToken,
          fullName: loginData.fullName,
          accountType: loginData.accountType,
        })
      );
      navigate('/');
    }
  }, [loginData, loginError, loginStatus, navigate, dispatch]);

  const loginSubmitHandler: FormEventHandler = (event) => {
    event.preventDefault();
    const loginInfo: LoginRequestDto = {
      username,
      password,
    };

    const loginRequestConfig = AccountApi.login(loginInfo);

    loginRequest(loginRequestConfig);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={8} className="vh-100">
          <div className="d-flex flex-column h-100 py-5">
            <Image src="/dn-tx-logo.png" alt="DN-TX logo" fluid />
            <div>
              <h3 className="text-center">Login</h3>
            </div>
            <Form onSubmit={loginSubmitHandler}>
              <Form.Group className="mb-3" controlId="loginFormUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="loginFormPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Login
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

export default Login;
