import { useEffect, useState } from 'react';
import { Col, Container, Image, Row, Button, Stack } from 'react-bootstrap';
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
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4}>
          <div>
            <Image fluid src="/dn-tx-logo.png" alt="DN-TX Logo" />
            {loggedIn && (
              <div className="d-flex flex-column">
                <Stack gap={3}>
                  <div>
                    <h3 className="text-center">Hello, {auth.fullName}</h3>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/search')}
                      className="w-100"
                    >
                      Search
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/create-transaction')}
                      className="w-100"
                    >
                      Create log
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/transactions')}
                      className="w-100"
                    >
                      Show logs
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/account')}
                      className="w-100"
                    >
                      Account
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={logoutHandler}
                      className="w-100"
                    >
                      Logout
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/export-and-import')}
                      className="w-100"
                    >
                      Export and Import
                    </Button>
                  </div>
                </Stack>
              </div>
            )}
            {!loggedIn && (
              <div className="d-flex flex-column align-items-stretch">
                <Stack gap={3}>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/search')}
                      className="w-100"
                    >
                      Search
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/login')}
                      className="w-100"
                    >
                      Login
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline-dark"
                      onClick={() => navigate('/register')}
                      className="w-100"
                    >
                      Register
                    </Button>
                  </div>
                </Stack>
              </div>
            )}
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default Home;
