import { useEffect, useState } from 'react';
import { Form, Col, Container, Row, Button, InputGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import TransactionApi, {
  Transaction,
  TransactionType,
  CreateEditTxFormInput,
  CreateEditTxFormInputSchema,
  TransactionItem,
  FileAttachment,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import {
  getZonedDateTimeFromDateString,
  transformTxItems,
} from '../util/utils';
import TransactionItemsCarousel from '../components/Transactions/TransactionItemsCarousel';
import FileAttachmentsCarousel from '../components/Transactions/FileAttachmentsCarousel';

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
};

function CreateTransaction() {
  const auth = useSelector((state: IRootState) => state.auth);
  const [isSaveBtnDisabled, setSaveBtnDisabled] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>(
    []
  );
  const [username, setUsername] = useState('');
  const [dateFinished, setDateFinished] = useState('');
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  const [type, setType] = useState<TransactionType>(TransactionType.ITEM2GOLD);

  // for handling save button disable
  useEffect(() => {
    if (isSaveBtnDisabled) {
      setTimeout(() => {
        setSaveBtnDisabled(false);
      }, 2000);
    }
  }, [isSaveBtnDisabled]);

  // initial form input values
  const createTxFormInitialValues: CreateEditTxFormInput = {
    username,
    type,
    fileAttachments,
    dateFinished,
    transactionItems,
  };

  const {
    data: createTxData,
    error: createTxError,
    sendRequest: createTxRequest,
    status: createTxStatus,
    resetHttpState: resetCreateTxReq,
  } = useHttp<Transaction>(false);

  const createTransactionSubmitHandler = (
    values: CreateEditTxFormInput,
    actions: FormikHelpers<CreateEditTxFormInput>
  ) => {
    scrollToTop();
    setSaveBtnDisabled(true);
    actions.setSubmitting(false);
    const transaction: Transaction = {
      username: values.username,
      fileAttachments: values.fileAttachments,
      creator: {
        username: auth.username,
      },
      reversed,
      type: values.type,
      dateFinished: getZonedDateTimeFromDateString(values.dateFinished),
      transactionItems: transformTxItems(values.type, transactionItems),
    };

    const createTxReqConf = TransactionApi.createAccountOwnTransactions(
      transaction,
      auth.accessToken
    );

    createTxRequest(createTxReqConf);
  };

  const reverseTxHandler = () => {
    setReversed((prevState) => !prevState);
  };

  const usernameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const dateFinishedChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDateFinished(e.target.value);
  };

  const resetFormInputs = () => {
    setUsername('');
    setDateFinished('');
    setTransactionItems([]);
    setType(TransactionType.ITEM2GOLD);
    setFileAttachments([]);
    resetCreateTxReq();
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4}>
          <div className="d-flex flex-column py-3">
            <div className="text-center mb-3">
              <h3>Create Transaction</h3>
            </div>
            <Formik
              validationSchema={CreateEditTxFormInputSchema}
              onSubmit={createTransactionSubmitHandler}
              initialValues={createTxFormInitialValues}
              enableReinitialize
            >
              {({ handleSubmit, handleBlur, values, touched, errors }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="mb-5">
                    <RequestStatusMessage
                      className="mb-2"
                      data={createTxData}
                      error={createTxError}
                      loadingMessage="Saving Transaction..."
                      status={createTxStatus}
                      successMessage="Transaction saved!"
                    />
                    <h5 className="mb-3">Transaction info</h5>
                    <Form.Group
                      className="mb-3"
                      controlId="createTxFormUsername"
                    >
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter username"
                        name="username"
                        value={values.username}
                        isValid={touched.username && !errors.username}
                        isInvalid={touched.username && !!errors.username}
                        onChange={usernameChangeHandler}
                        onBlur={handleBlur}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group
                      className="mb-3"
                      controlId="createTxFormDateFinished"
                    >
                      <Form.Label>Date finished</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="dateFinished"
                        value={values.dateFinished}
                        isValid={touched.dateFinished && !errors.dateFinished}
                        isInvalid={
                          touched.dateFinished && !!errors.dateFinished
                        }
                        onChange={dateFinishedChangeHandler}
                        onBlur={handleBlur}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dateFinished}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="createTxFormType">
                      <Form.Label>Type</Form.Label>
                      <InputGroup>
                        <Form.Select
                          aria-label="Transaction type"
                          name="type"
                          value={type}
                          isValid={touched.type && !errors.type}
                          isInvalid={touched.type && !!errors.type}
                          onChange={(e) =>
                            setType(e.currentTarget.value as TransactionType)
                          }
                          onBlur={handleBlur}
                        >
                          <option value={TransactionType.CC2GOLD}>
                            {reversed ? 'Gold to CC' : 'CC to Gold'}
                          </option>
                          <option value={TransactionType.GOLD2PHP}>
                            {reversed ? 'PHP to Gold' : 'Gold to PHP'}
                          </option>
                          <option value={TransactionType.ITEM2GOLD}>
                            {reversed ? 'Gold to Item' : 'Item to Gold'}
                          </option>
                        </Form.Select>
                        <Button
                          variant="outline-secondary"
                          onClick={reverseTxHandler}
                        >
                          <ArrowLeftRight />
                        </Button>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        {errors.type}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <TransactionItemsCarousel
                      transactionItems={transactionItems}
                      txType={values.type}
                      key="transaction-carousel"
                      readOnly={false}
                      setNewTxItems={setTransactionItems}
                      touched={touched}
                      errors={errors}
                    />
                  </div>
                  <div className="mb-3">
                    <h5>File attachments</h5>
                    <div>
                      <FileAttachmentsCarousel
                        fileAttachments={fileAttachments}
                        readOnly={false}
                        errors={errors}
                        touched={touched}
                        setNewFileAttachments={setFileAttachments}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="secondary"
                      type="button"
                      className="me-3"
                      onClick={resetFormInputs}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="success"
                      type="submit"
                      disabled={isSaveBtnDisabled}
                    >
                      {isSaveBtnDisabled ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
            <div className="text-center mt-auto">
              <Link to="/">Back to Home</Link>
            </div>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default CreateTransaction;
