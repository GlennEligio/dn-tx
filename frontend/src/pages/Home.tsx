import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IRootState } from '../store';
import { authActions } from '../store/authSlice';

function Home() {
  const auth = useSelector((state: IRootState) => state.auth);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.accessToken && auth.fullName && auth.username) {
      setLoggedIn(true);
    }
  }, [auth.accessToken, navigate, auth.fullName, auth.username]);

  const logoutHandler = () => {
    dispatch(authActions.removeAuth());
    navigate('/login');
  };

  return (
    <div>
      <img src="/dn-tx-logo.png" alt="DN-TX logo" style={{ width: '200px' }} />
      {loggedIn && (
        <>
          <div>
            <h1>Hello {auth.fullName}</h1>
          </div>
          <div>
            <button type="button" onClick={() => navigate('/search')}>
              Search
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate('/create-transaction')}
            >
              Create log
            </button>
          </div>
          <div>
            <button type="button" onClick={() => navigate('/transactions')}>
              Show logs
            </button>
          </div>
          <div>
            <button type="button" onClick={() => navigate('/account')}>
              Account
            </button>
          </div>
          <div>
            <button type="button" onClick={logoutHandler}>
              Logout
            </button>
          </div>
        </>
      )}
      {!loggedIn && (
        <>
          <div>
            <button type="button" onClick={() => navigate('/search')}>
              Search
            </button>
          </div>
          <div>
            <button type="button" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
          <div>
            <button type="button" onClick={() => navigate('/register')}>
              Register
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
