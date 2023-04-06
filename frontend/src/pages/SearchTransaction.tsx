import React, { FormEventHandler, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import TransactionApi, { Transaction } from '../api/transaction-api';
import useHttp from '../hooks/useHttp';

function SearchTransaction() {
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');

  const {
    data: transactionData,
    error: transactionError,
    sendRequest: transactionRequest,
    status: transactionStatus,
  } = useHttp<Transaction>(false);

  useEffect(() => {
    if (
      transactionData !== null &&
      transactionError === null &&
      transactionStatus === 'completed'
    ) {
      console.log(transactionData);
    }
  }, [transactionData, transactionError, transactionStatus]);

  const transactionSearchSubmitHandler: FormEventHandler = (e) => {
    e.preventDefault();

    const transactionSearchRequestConfig =
      TransactionApi.getTransactionByUsernameAndId(username, id);

    transactionRequest(transactionSearchRequestConfig);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={8} md={6} lg={4} className="vh-100 py-5">
          <div className="d-flex flex-column h-100">
            <div className="mb-3 text-center">
              <h3>Search for Transaction</h3>
            </div>
            <Form onSubmit={transactionSearchSubmitHandler}>
              <Form.Group className="mb-3" controlId="searchFormTransactionId">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter transaction id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="searchFormUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Search
                </Button>
              </div>
            </Form>
            {transactionData && (
              <div className="text-center mt-5">
                <h3>Match found:</h3>
                <Link
                  key={transactionData.id}
                  to={`/transactions/${transactionData.id}`}
                >
                  {transactionData.id}
                </Link>
              </div>
            )}

            {transactionStatus === 'completed' && transactionError !== null && (
              <div className="text-center mt-5">
                <h3>No match found</h3>
              </div>
            )}
            <div className="mt-auto text-center">
              <Link to="/">Back to home</Link>
            </div>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default SearchTransaction;
