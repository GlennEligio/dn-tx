import { FormEventHandler, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import TransactionApi, { Transaction } from '../api/transaction-api';
import useHttp from '../hooks/useHttp';

interface SearchTxInput {
  id: string;
  username: string;
}

const searchTxFormInputSchema = yup.object().shape({
  username: yup.string().required('Username is required.'),
  id: yup.string().required('Id is required.'),
});

function SearchTransaction() {
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');

  const searchTxFormInitialValues: SearchTxInput = {
    username: '',
    id: '',
  };

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

  const searchTxSubmitHandler = (
    values: SearchTxInput,
    actions: FormikHelpers<SearchTxInput>
  ) => {
    const transactionSearchRequestConfig =
      TransactionApi.getTransactionByUsernameAndId(values.username, values.id);

    transactionRequest(transactionSearchRequestConfig);
    actions.setSubmitting(false);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4} className="vh-100 py-5">
          <div className="d-flex flex-column h-100">
            <div className="mb-3 text-center">
              <h3>Search for Transaction</h3>
            </div>
            <Formik
              onSubmit={searchTxSubmitHandler}
              validationSchema={searchTxFormInputSchema}
              initialValues={searchTxFormInitialValues}
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group
                    className="mb-3"
                    controlId="searchFormTransactionId"
                  >
                    <Form.Label>Transaction ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter transaction id"
                      name="id"
                      value={values.id}
                      isValid={touched.id && !errors.id}
                      isInvalid={touched.id && !!errors.id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.id}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="searchFormUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      name="username"
                      value={values.username}
                      isValid={touched.username && !errors.username}
                      isInvalid={touched.username && !!errors.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                      Search
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>

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
