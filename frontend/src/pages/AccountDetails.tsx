import { useEffect, useState } from 'react';
import { Container, Col, Row, Form, Button, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { IRootState } from '../store';
import useHttp from '../hooks/useHttp';
import accountApi, { Account } from '../api/account-api';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';

interface UpdateAccountFormInput {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

function AccountDetails() {
  const auth = useSelector((state: IRootState) => state.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: accountData,
    error: accountError,
    status: accountStatus,
    sendRequest: accountSendRequest,
  } = useHttp<Account>(false);

  const {
    data: updateAccountData,
    error: updateAccountError,
    status: updateAccountStatus,
    sendRequest: updateAccountSendRequest,
    resetHttpState: updateAccountResetStatus,
  } = useHttp<Account>(false);

  // Fetch own account details on mount
  useEffect(() => {
    const accountOwnDetailsReqConf = accountApi.getOwnAccountDetails(
      auth.accessToken
    );
    accountSendRequest(accountOwnDetailsReqConf);
  }, [auth.accessToken, accountSendRequest]);

  // Update the account info states based on updateAccount request
  // Also make the inputs readonly
  useEffect(() => {
    if (
      updateAccountData &&
      updateAccountError === null &&
      updateAccountStatus === 'completed'
    ) {
      setUsername(updateAccountData.username || '');
      setEmail(updateAccountData.email || '');
      setFullName(updateAccountData.fullName || '');
    }
  }, [
    updateAccountData,
    updateAccountError,
    updateAccountStatus,
    updateAccountResetStatus,
  ]);

  const updateAccountFormInputSchema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    email: yup
      .string()
      .email('Email must be valid')
      .required('Email is required'),
    fullName: yup.string().required('Full name is required'),
  });
  // Update the account info states based on getOwnAccount request
  useEffect(() => {
    if (accountData && accountError === null && accountStatus === 'completed') {
      setUsername(accountData.username || '');
      setEmail(accountData.email || '');
      setFullName(accountData.fullName || '');
    }
  }, [accountData, accountError, accountStatus]);

  const updateClickHandler = () => {
    setIsEditing(true);
  };

  const initialUpdateAccountFormValues: UpdateAccountFormInput = {
    username,
    password: '',
    fullName,
    email,
  };

  const updateAccountSubmitHandler = (
    values: UpdateAccountFormInput,
    actions: FormikHelpers<UpdateAccountFormInput>
  ) => {
    actions.setSubmitting(false);
    const updatedAccount: Account = {
      username: values.username,
      email: values.email,
      fullName: values.fullName,
      password: values.password,
    };
    const updateOwnAccountReqConf = accountApi.updateOwnAccountDetails(
      updatedAccount,
      auth.accessToken
    );
    updateAccountSendRequest(updateOwnAccountReqConf);
  };

  const cancelClickHandler = () => {
    const accountOwnDetailsReqConf = accountApi.getOwnAccountDetails(
      auth.accessToken
    );
    accountSendRequest(accountOwnDetailsReqConf);
    setIsEditing(false);
    updateAccountResetStatus();
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4} className="vh-100">
          <div className="d-flex flex-column h-100 py-5">
            <div className="text-center mb-3">
              <h3>Account Information</h3>
            </div>
            <Formik
              validationSchema={updateAccountFormInputSchema}
              onSubmit={updateAccountSubmitHandler}
              initialValues={initialUpdateAccountFormValues}
              enableReinitialize
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
                resetForm,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <RequestStatusMessage
                    data={updateAccountData}
                    error={updateAccountError}
                    loadingMessage="Updating account..."
                    status={updateAccountStatus}
                    successMessage="Update success!"
                  />
                  <Form.Group className="mb-3" controlId="accountFormUsername">
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
                  <Form.Group className="mb-3" controlId="accountFormPassword">
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
                  <Form.Group className="mb-3" controlId="accountFormEmail">
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
                  <Form.Group className="mb-3" controlId="accountFormFullName">
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
                  <div className="d-flex justify-content-end">
                    {!isEditing && (
                      <Button
                        variant="primary"
                        type="button"
                        onClick={updateClickHandler}
                      >
                        Update
                      </Button>
                    )}
                    {isEditing && (
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="success" type="submit">
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => {
                            cancelClickHandler();
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    )}
                  </div>
                </Form>
              )}
            </Formik>

            <div className="mt-auto text-center">
              <Link to="/">Back to Home</Link>
            </div>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default AccountDetails;
