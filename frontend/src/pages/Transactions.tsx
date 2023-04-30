import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import TransactionApi, { TransactionPageDto } from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import TransactionCard from '../components/Transactions/TransactionCard';
import PaginationWidget from '../components/UI/PaginationWidget';

function Transactions() {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getAccountOwnTransactionsReqConf =
    TransactionApi.getAccountOwnTransactions(
      auth.accessToken,
      parseInt(searchParams.get('pageNumber') || '1', 10),
      10
    );

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

  const redirectUrlFn = (page: number) => {
    return `/transactions?pageNumber=${page}`;
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col
          xs={10}
          md={8}
          lg={6}
          xl={4}
          className="d-flex flex-column py-3 vh-100"
        >
          <div className="text-center mb-3">
            <h3>Latest transactions</h3>
          </div>
          <div className="d-flex justify-content-center">
            <PaginationWidget
              currentPage={
                latestTxData?.pageNumber ? latestTxData.pageNumber + 1 : 1
              }
              totalPages={
                latestTxData?.totalPages ? latestTxData.totalPages : 1
              }
              maxPageDisplay={3}
              redirectUrl={redirectUrlFn}
            />
          </div>
          <div className="overflow-auto">
            {latestTxData &&
              latestTxError === null &&
              latestTxStatus === 'completed' &&
              latestTxData.transactions.map((tx) => (
                <TransactionCard
                  transaction={tx}
                  key={tx.id}
                  className="mb-3"
                />
              ))}
          </div>
          <div className="text-center">
            <Link to="/">Back to home</Link>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default Transactions;
