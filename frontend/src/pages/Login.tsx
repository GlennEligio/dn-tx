import { useEffect } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import AccountApi, {
  LoginRequestDto,
  LoginResponseDto,
} from '../api/account-api';
import useHttp from '../hooks/useHttp';
import { authActions } from '../store/authSlice';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import DnTxLogo from '../components/UI/DnTxLogo';

interface LoginInputFormSchema {
  username: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const schema = yup.object().shape({
    username: yup.string().required('Username is required.'),
    password: yup.string().required('Password is required.'),
  });

  const initialLoginFormValues: LoginInputFormSchema = {
    username: '',
    password: '',
  };

  // useHttp hooks
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

  const loginFormikSubmitHandler = (
    values: LoginInputFormSchema,
    action: FormikHelpers<LoginInputFormSchema>
  ) => {
    action.setSubmitting(false);
    const loginInfo: LoginRequestDto = {
      username: values.username,
      password: values.password,
    };

    const loginRequestConfig = AccountApi.login(loginInfo);

    loginRequest(loginRequestConfig);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4} className="vh-100">
          <div className="d-flex flex-column h-100 py-5">
            <DnTxLogo />
            <div>
              <h3 className="text-center">Login</h3>
            </div>
            <Formik
              validationSchema={schema}
              onSubmit={loginFormikSubmitHandler}
              initialValues={initialLoginFormValues}
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
              }) => (
                <Form noValidate onSubmit={handleSubmit}>
                  <RequestStatusMessage
                    data={loginData}
                    error={loginError}
                    loadingMessage="Logging in..."
                    status={loginStatus}
                    successMessage="Login successful!"
                  />
                  <Form.Group className="mb-3" controlId="loginFormUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      name="username"
                      value={values.username}
                      isValid={touched.username && !errors.username}
                      isInvalid={touched.username && !!errors.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginFormPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      isValid={touched.password && !errors.password}
                      isInvalid={touched.password && !!errors.password}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <div className="d-flex justify-content-between">
                    <Link to="/forgot">Forgot password?</Link>
                    <Button variant="primary" type="submit">
                      Login
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>

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
