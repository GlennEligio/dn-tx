import { useEffect } from 'react';
import { Col, Container, Row, Image, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import accountApi, {
  LoginResponseDto,
  RegisterRequestDto,
} from '../api/account-api';
import useHttp from '../hooks/useHttp';
import RequestStatusMessage from '../components/Transactions/RequestStatusMessage';
import { authActions } from '../store/authSlice';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  interface RegisterFormInput {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }

  const initialRegisterFormInputs: RegisterFormInput = {
    username: '',
    password: '',
    email: '',
    fullName: '',
  };

  const registerFormInputSchema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    email: yup
      .string()
      .email('Email must be valid')
      .required('Email is required'),
    fullName: yup.string().required('Full name is required'),
  });

  const {
    data: registerData,
    error: registerError,
    sendRequest: registerRequest,
    status: registerStatus,
  } = useHttp<LoginResponseDto>(false);

  useEffect(() => {
    if (
      registerData &&
      registerError === null &&
      registerStatus === 'completed'
    ) {
      dispatch(
        authActions.saveAuth({
          username: registerData.username,
          accessToken: registerData.accessToken,
          fullName: registerData.fullName,
          accountType: registerData.accountType,
        })
      );
      navigate('/');
      navigate('/');
    }
  }, [registerData, registerError, registerStatus, navigate, dispatch]);

  const registerSubmitHandler = (
    values: RegisterFormInput,
    action: FormikHelpers<RegisterFormInput>
  ) => {
    action.setSubmitting(false);
    const registerInfo: RegisterRequestDto = {
      username: values.username,
      password: values.password,
      email: values.email,
      fullName: values.fullName,
    };

    const registerRequestConfig = accountApi.register(registerInfo);

    registerRequest(registerRequestConfig);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} className="vh-100">
          <div className="d-flex flex-column h-100 py-5">
            <Image src="/dn-tx-logo.png" alt="DN-TX logo" fluid />
            <div>
              <h3 className="text-center">Register</h3>
            </div>
            <Formik
              validationSchema={registerFormInputSchema}
              onSubmit={registerSubmitHandler}
              initialValues={initialRegisterFormInputs}
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <RequestStatusMessage
                    data={registerData}
                    error={registerError}
                    loadingMessage="Registering..."
                    status={registerStatus}
                    successMessage="Register successful!"
                  />
                  <Form.Group className="mb-3" controlId="registerFormUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      name="username"
                      value={values.username}
                      isValid={touched.username && !errors.username}
                      isInvalid={!!errors.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerFormPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={values.password}
                      isValid={touched.password && !errors.password}
                      isInvalid={!!errors.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerFormFullName">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter full name"
                      name="fullName"
                      value={values.fullName}
                      isValid={touched.fullName && !errors.fullName}
                      isInvalid={!!errors.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fullName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="registerFormEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      name="email"
                      value={values.email}
                      isValid={touched.email && !errors.email}
                      isInvalid={!!errors.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                      Register
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

export default Register;
