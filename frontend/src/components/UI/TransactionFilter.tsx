import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Col, Form, Offcanvas, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowClockwise } from 'react-bootstrap-icons';
import transactionApi, {
  TransactionPageDto,
  TransactionType,
} from '../../api/transaction-api';
import useHttp from '../../hooks/useHttp';
import { IRootState } from '../../store';

interface TransactionFilterProps {
  initTxType: TransactionType[];
  initAfterDate: string;
  initBeforeDate: string;
  show: boolean;
  handleClose: () => void;
}

const txTypesLabels = [
  TransactionType.CC2GOLD,
  TransactionType.GOLD2PHP,
  TransactionType.ITEM2GOLD,
];

function TransactionFilter({
  initTxType,
  initAfterDate,
  initBeforeDate,
  show,
  handleClose,
}: TransactionFilterProps) {
  const navigate = useNavigate();
  const auth = useSelector((state: IRootState) => state.auth);
  const [txType, setTxType] = useState<TransactionType[]>(initTxType);
  const [afterDate, setAfterDate] = useState(initAfterDate);
  const [beforeDate, setBeforeDate] = useState(initBeforeDate);

  // used for fetching filtered transaction list count
  const {
    data: filteredTxData,
    status: filteredTxStatus,
    sendRequest: filteredTxRequest,
  } = useHttp<TransactionPageDto>(false);

  const isLoading = filteredTxStatus === 'pending';

  const saveSearchFiltersHandler = () => {
    const urlParams = {
      txType: txType.join(','),
      afterDate,
      beforeDate,
    };
    navigate(`?${new URLSearchParams(urlParams).toString()}`);
  };

  // send request to fetch filtered transaction list based on search filter
  useEffect(() => {
    const requestConf = transactionApi.getAccountOwnTransactions(
      auth.accessToken,
      1,
      10,
      txType.join(','),
      afterDate,
      beforeDate
    );
    filteredTxRequest(requestConf);
  }, [auth.accessToken, txType, beforeDate, afterDate, filteredTxRequest]);

  const setTxTypeArray = (txTypeParam: TransactionType, isChecked: boolean) => {
    setTxType((prevState) => {
      if (isChecked) {
        if (!prevState.includes(txTypeParam)) {
          return [...prevState, txTypeParam];
        }
      } else {
        return prevState.filter((t) => t !== txTypeParam);
      }
      return prevState;
    });
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Search Filters</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form>
          <div className="mb-5">
            <div className="mb-3">
              <Form.Label>
                <h6>Date finished</h6>
              </Form.Label>
              <Row>
                <Col xs={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="createTxFormAfterDateFinished"
                  >
                    <Form.Control
                      type="datetime-local"
                      name="afterDateFinished"
                      value={afterDate}
                      onChange={(e) => setAfterDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="createTxFormBeforeDateFinished"
                  >
                    <Form.Control
                      type="datetime-local"
                      name="beforeDateFinished"
                      value={beforeDate}
                      onChange={(e) => setBeforeDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <div>
              <Form.Group className="mb-3" controlId="editTxFormType">
                <Form.Label>
                  <h6>Transaction type</h6>
                </Form.Label>
                {txTypesLabels.map((type) => {
                  return (
                    <Form.Check // prettier-ignore
                      key={type}
                      type="checkbox"
                      label={type}
                      checked={txType.includes(type)}
                      onChange={(e) =>
                        setTxTypeArray(type, e.currentTarget.checked)
                      }
                    />
                  );
                })}
              </Form.Group>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="button"
              onClick={saveSearchFiltersHandler}
            >
              {isLoading && <ArrowClockwise className="fs-5" />}
              {!isLoading && (
                <span>Apply ({filteredTxData?.totalTransactions})</span>
              )}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default TransactionFilter;
