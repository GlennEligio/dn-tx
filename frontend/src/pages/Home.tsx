import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IRootState } from '../store';
import { authActions } from '../store/authSlice';

function Home() {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.accessToken === null || auth.accessToken === '') {
      navigate('/login');
    }
  }, [auth.accessToken, navigate]);

  const logoutHandler = () => {
    dispatch(authActions.removeAuth());
    navigate('/login');
  };

  return (
    <div>
      <img src="/dn-tx-logo.png" alt="DN-TX logo" style={{ width: '200px' }} />
      <div>
        <h1>Hello {auth.fullName}</h1>
      </div>
      <div>
        <button type="button" onClick={() => navigate('/search')}>
          Search
        </button>
      </div>
      <div>
        <button type="button" onClick={() => navigate('/create-transaction')}>
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
    </div>
  );
}

export default Home;
