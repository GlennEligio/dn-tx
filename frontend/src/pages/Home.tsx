import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import TransactionApi, { TransactionPageDto } from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';

function Home() {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();

  const getAccountOwnTransactionsReqConf =
    TransactionApi.getAccountOwnTransactions(auth.accessToken, 0, 10);

  const {
    data: latestTxData,
    error: latestTxError,
    status: latestTxStatus,
  } = useHttp<TransactionPageDto>(true, getAccountOwnTransactionsReqConf);

  useEffect(() => {
    if (auth.accessToken === null || auth.accessToken === '') {
      navigate('/login');
    }
  }, [auth.accessToken, navigate]);

  useEffect(() => {
    if (
      latestTxData !== null &&
      latestTxError === null &&
      latestTxStatus === 'completed'
    ) {
      console.log(latestTxData);
    }
  }, [latestTxData, latestTxError, latestTxStatus]);

  return (
    <div>
      <div>
        <h1>Hello {auth.fullName}</h1>
      </div>
      <h1>Latest transactions</h1>
      <div>
        {latestTxData &&
          latestTxError === null &&
          latestTxStatus === 'completed' &&
          latestTxData.transactions.map((tx) => (
            <div key={tx.id!}>
              <Link to={`/transactions/${tx.id}`}>{tx.id!}</Link>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Home;
