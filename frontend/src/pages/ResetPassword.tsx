import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, redirect, useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import useHttp from '../hooks/useHttp';
import accountApi from '../api/account-api';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import { getCharacterValidationError } from '../util/utils';
import { useEffect } from 'react';

interface ResetPasswordInput {
  newPassword: string;
  rePassword: string;
}

const resetPasswordFormInputSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must have at least 8 characters') // check minimum characters
    // different error messages for different requirements
    .matches(/[0-9]/, getCharacterValidationError('digit'))
    .matches(/[a-z]/, getCharacterValidationError('lowercase'))
    .matches(/[A-Z]/, getCharacterValidationError('uppercase')),
  rePassword: yup
    .string()
    .required('Please re-type the password')
    .oneOf([yup.ref('newPassword')], 'Password does not match'),
});

const initialresetPasswordInput: ResetPasswordInput = {
  rePassword: '',
  newPassword: '',
};

function ResetPassword() {
  const [searchParam] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParam.get('token');
  const {
    data: resetPasswordData,
    error: resetPasswordError,
    sendRequest: resetPasswordRequest,
    status: resetPasswordStatus,
  } = useHttp<{ success: boolean }>(false);

  useEffect(() => {
    if (
      resetPasswordData &&
      resetPasswordError === null &&
      resetPasswordStatus === 'completed'
    ) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }
  }, [resetPasswordData, resetPasswordError, resetPasswordStatus]);

  const resetPasswordSubmitHandler = (
    values: ResetPasswordInput,
    actions: FormikHelpers<ResetPasswordInput>
  ) => {
    const resetPasswordReqConfig = accountApi.resetPassword(
      values.newPassword,
      token || ''
    );

    resetPasswordRequest(resetPasswordReqConfig);
    actions.setSubmitting(false);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4} className="vh-100 py-5">
          <div className="d-flex flex-column h-100">
            <div className="mb-3 text-center">
              <h3>Reset Password</h3>
            </div>
            <Formik
              onSubmit={resetPasswordSubmitHandler}
              validationSchema={resetPasswordFormInputSchema}
              initialValues={initialresetPasswordInput}
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
                    data={resetPasswordData}
                    error={resetPasswordError}
                    loadingMessage="Resetting password..."
                    status={resetPasswordStatus}
                    successMessage="Reset password success! Redirecting to login page..."
                  />
                  <Form.Group
                    className="mb-3"
                    controlId="resetPasswordNewPassword"
                  >
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      name="newPassword"
                      value={values.newPassword}
                      isValid={touched.newPassword && !errors.newPassword}
                      isInvalid={touched.newPassword && !!errors.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.newPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="resetPasswordRePassword"
                  >
                    <Form.Label>Re-enter Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Re-enter password"
                      name="rePassword"
                      value={values.rePassword}
                      isValid={touched.rePassword && !errors.rePassword}
                      isInvalid={touched.rePassword && !!errors.rePassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.rePassword}
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

export default ResetPassword;
