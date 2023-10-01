import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { FilterRight } from 'react-bootstrap-icons';
import TransactionApi, {
  TransactionPageDto,
  TransactionType,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import TransactionCard from '../components/Transactions/TransactionCard';
import PaginationWidget from '../components/UI/PaginationWidget';
import TransactionFilter from '../components/UI/TransactionFilter';

function Transactions() {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);

  const {
    data: latestTxData,
    error: latestTxError,
    status: latestTxStatus,
    sendRequest: getAccountOwnTransactionsRequest,
  } = useHttp<TransactionPageDto>(false);

  // check if user is logged in or valid
  useEffect(() => {
    if (auth.accessToken === null || auth.accessToken === '') {
      navigate('/login');
    }
  }, [auth.accessToken, navigate]);

  // send request to fetch transaction list based on search filter
  useEffect(() => {
    const requestConf = TransactionApi.getAccountOwnTransactions(
      auth.accessToken,
      parseInt(searchParams.get('pageNumber') || '1', 10),
      10,
      searchParams.get('txType') || '',
      searchParams.get('afterDate') || '',
      searchParams.get('beforeDate') || ''
    );
    getAccountOwnTransactionsRequest(requestConf);
  }, [auth.accessToken, searchParams, getAccountOwnTransactionsRequest]);

  // for constructing redirect url of pagination widget items
  const redirectUrlFn = (pageParam: number) => {
    let searchFilterUrlParams = '';
    if (searchParams) {
      const urlParams = {
        txType: searchParams.get('txType') || '',
        afterDate: searchParams.get('afterDate') || '',
        beforeDate: searchParams.get('beforeDate') || '',
        pageNumber: pageParam.toString(),
      };
      searchFilterUrlParams = `${new URLSearchParams(urlParams).toString()}`;
    }
    return `/transactions?${searchFilterUrlParams}`;
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} className="d-flex flex-column py-3 vh-100">
          <Row>
            <Col />
            <Col xs={8}>
              <div className="text-center mb-3">
                <h3>Latest transactions</h3>
              </div>
            </Col>
            <Col className="d-flex justify-content-end ">
              <FilterRight
                className="fs-1"
                onClick={() => setShowFilter(true)}
              />
            </Col>
          </Row>

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
      <Row>
        <Col>
          <TransactionFilter
            show={showFilter}
            handleClose={() => setShowFilter(false)}
            initAfterDate={searchParams.get('afterDate') || ''}
            initBeforeDate={searchParams.get('beforeDate') || ''}
            initTxType={
              (searchParams.get('txType') || '').split(',') as TransactionType[]
            }
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Transactions;
