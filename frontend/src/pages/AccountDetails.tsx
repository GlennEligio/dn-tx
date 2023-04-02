import { FormEventHandler, useEffect, useState } from 'react';
import { Container, Col, Row, Form, Button, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../store';
import useHttp from '../hooks/useHttp';
import accountApi, { Account } from '../api/account-api';

function AccountDetails() {
  const auth = useSelector((state: IRootState) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      setIsEditing(false);
    }
  }, [updateAccountData, updateAccountError, updateAccountStatus]);

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

  const saveAccountHandler: FormEventHandler = (e) => {
    e.preventDefault();
    console.log('Saving the account');
    const updatedAccount: Account = {
      username,
      email,
      fullName,
      password,
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
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col className="vh-100">
          <div className="d-flex flex-column h-100 py-5">
            <div className="text-center mb-3">
              <h3>Account Information</h3>
            </div>
            <Form onSubmit={saveAccountHandler}>
              <Form.Group className="mb-3" controlId="accountFormUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  readOnly
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="accountFormPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  readOnly={!isEditing}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="accountFormEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  readOnly={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="accountFormFullName">
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  readOnly={!isEditing}
                  onChange={(e) => setFullName(e.target.value)}
                />
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
                      onClick={cancelClickHandler}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </div>
            </Form>
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
