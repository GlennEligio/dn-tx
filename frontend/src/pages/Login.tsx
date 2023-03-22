import React, { FormEventHandler, useEffect, useState } from 'react';
import AccountApi, {
  LoginRequestDto,
  LoginResponseDto,
} from '../api/account-api';
import useHttp from '../hooks/useHttp';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
      console.log(loginData);
    }
  }, [loginData, loginError, loginStatus]);

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
    <div>
      <h1>Login</h1>
      <form onSubmit={loginSubmitHandler}>
        <div>
          <span>Username: </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <span>Password: </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <input type="submit" value="Login" />
        </div>
      </form>
    </div>
  );
}

export default Login;
