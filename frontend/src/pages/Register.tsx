import { FormEventHandler, useEffect, useState } from 'react';
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
    <div>
      <div>
        <h1>Register</h1>
      </div>
      <div>
        <form onSubmit={registerSubmitHandler}>
          <div>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div>
            <span>Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <input type="submit" value="Register" />
          </div>
        </form>
      </div>
      <div>
        <Link to="/">Back to home</Link>
      </div>
    </div>
  );
}

export default Register;
