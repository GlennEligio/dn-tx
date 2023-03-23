import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IRootState } from '../store';

function Home() {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.accessToken === null || auth.accessToken === '') {
      navigate('/login');
    }
  }, [auth.accessToken, navigate]);

  return (
    <div>
      <div>
        <h1>Hello {auth.fullName}</h1>
      </div>
      <div>
        <h1>Latest transactions</h1>
      </div>
    </div>
  );
}

export default Home;
