import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import useHttp from '../hooks/useHttp';
import accountApi from '../api/account-api';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';

interface ForgotPasswordInput {
  email: string;
}

const forgotPasswordFormInputSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email must be valid')
    .required('Email is required.'),
});

const initialForgotPasswordInput: ForgotPasswordInput = {
  email: '',
};

function ForgotPassword() {
  const {
    data: forgotPasswordData,
    error: forgotPasswordError,
    sendRequest: forgotPasswordRequest,
    status: forgotPasswordStatus,
  } = useHttp<{ success: boolean }>(false);

  const forgotPasswordSubmitHandler = (
    values: ForgotPasswordInput,
    actions: FormikHelpers<ForgotPasswordInput>
  ) => {
    const forgotPasswordReqConfig = accountApi.forgotPassword(values.email);

    forgotPasswordRequest(forgotPasswordReqConfig);
    actions.setSubmitting(false);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4} className="vh-100 py-5">
          <div className="d-flex flex-column h-100">
            <div className="mb-3 text-center">
              <h3>Account Recovery</h3>
              <p>
                Please enter the email of your account. An email will be sent to
                it with the password recovery link
              </p>
            </div>
            <Formik
              onSubmit={forgotPasswordSubmitHandler}
              validationSchema={forgotPasswordFormInputSchema}
              initialValues={initialForgotPasswordInput}
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
                    className="mb-2"
                    data={forgotPasswordData}
                    error={forgotPasswordError}
                    loadingMessage="Sending reset password email..."
                    status={forgotPasswordStatus}
                    successMessage="Reset password has been successfully sent!"
                  />
                  <Form.Group className="mb-3" controlId="forgotPasswordEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter account email"
                      name="email"
                      value={values.email}
                      isValid={touched.email && !errors.email}
                      isInvalid={touched.email && !!errors.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                      Send
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

export default ForgotPassword;
