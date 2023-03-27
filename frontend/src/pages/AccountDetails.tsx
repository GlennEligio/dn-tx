import { FormEventHandler, useEffect, useState } from 'react';
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
    <div>
      <div>
        <h1>Account Information</h1>
      </div>
      <div>
        <form onSubmit={saveAccountHandler}>
          <div>
            <span>Username: </span>
            <input
              type="text"
              value={username}
              readOnly
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <span>Password: </span>
            <input
              type="password"
              value={password}
              readOnly={!isEditing}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <span>Email: </span>
            <input
              type="text"
              value={email}
              readOnly={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <span>Full name:</span>
            <input
              type="text"
              value={fullName}
              readOnly={!isEditing}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          {!isEditing && (
            <button type="button" onClick={updateClickHandler}>
              Update
            </button>
          )}
          {isEditing && (
            <>
              <button type="submit">Save </button>
              <button type="button" onClick={cancelClickHandler}>
                Cancel
              </button>
            </>
          )}
        </form>
      </div>
      <div>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default AccountDetails;
