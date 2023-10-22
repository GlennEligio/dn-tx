import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Stack,
  InputGroup,
} from 'react-bootstrap';
import { FieldArray, Formik, FormikHelpers, getIn } from 'formik';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import transactionApi, {
  FileAttachment,
  Transaction,
  TransactionType,
  CcToGoldTransactionItem,
  GoldToPhpTransactionItem,
  ItemToGoldTransactionItem,
  TransactionItem,
  CreateEditTxFormInputSchema,
  CreateEditTxFormInput,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import {
  getDateFromZonedDateTimeString,
  getZonedDateTimeFromDateString,
  transformTxItems,
} from '../util/utils';
import TransactionItemsCarousel from '../components/Transactions/TransactionItemsCarousel';
import FileAttachmentsCarousel from '../components/Transactions/FileAttachmentsCarousel';

function EditTransaction() {
  const auth = useSelector((state: IRootState) => state.auth);
  const { transactionId } = useParams();

  // General Transaction inputs
  const [username, setUsername] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.CC2GOLD);
  const [dateFinished, setDateFinished] = useState('');
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  const [reversed, setReversed] = useState(false);

  // TransactionItems
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>(
    []
  );

  // initial form input values
  const editTxFormInitialValues: CreateEditTxFormInput = {
    username,
    dateFinished,
    type,
    fileAttachments,
    transactionItems,
  };

  // For fetching the current Transaction data
  const {
    data: currentTxData,
    error: currentTxError,
    status: currentTxStatus,
    sendRequest: currentTxRequest,
  } = useHttp<Transaction>(false);

  // For updating transaction data
  const {
    data: editTxData,
    error: editTxError,
    sendRequest: editTxRequest,
    status: editTxStatus,
  } = useHttp<Transaction>(false);

  // Fetch the current Transaction data on component mount
  useEffect(() => {
    if (transactionId) {
      const getTransactionByIdReqConf =
        transactionApi.getTransactionById(transactionId);
      currentTxRequest(getTransactionByIdReqConf);
    }
  }, [transactionId, currentTxRequest]);

  // Checking the result of current transaction request
  // If present, use the data to populate the inputs
  useEffect(() => {
    if (
      currentTxData &&
      currentTxError === null &&
      currentTxStatus === 'completed'
    ) {
      setUsername(currentTxData.username);
      setType(currentTxData.type);
      setDateFinished(currentTxData.dateFinished);
      setFileAttachments(currentTxData.fileAttachments);
      setReversed(currentTxData.reversed);

      if (currentTxData.type === TransactionType.CC2GOLD) {
        const ccToGoldTxItems =
          currentTxData.transactionItems as CcToGoldTransactionItem[];
        setTransactionItems(ccToGoldTxItems);
      }

      if (currentTxData.type === TransactionType.GOLD2PHP) {
        const goldToPhpTxItems =
          currentTxData.transactionItems as GoldToPhpTransactionItem[];
        setTransactionItems(goldToPhpTxItems);
      }

      if (currentTxData.type === TransactionType.ITEM2GOLD) {
        const itemToGoldTxItems =
          currentTxData.transactionItems as ItemToGoldTransactionItem[];
        setTransactionItems(itemToGoldTxItems);
      }
    }
  }, [currentTxData, currentTxError, currentTxStatus]);

  // Edit Transcation form submit handler
  const editTransactionSubmitHandler = (
    values: CreateEditTxFormInput,
    actions: FormikHelpers<CreateEditTxFormInput>
  ) => {
    if (transactionId) {
      const transaction: Transaction = {
        username: values.username,
        dateFinished: getZonedDateTimeFromDateString(values.dateFinished),
        fileAttachments: values.fileAttachments,
        creator: {
          username: auth.username,
        },
        transactionItems: transformTxItems(values.type, transactionItems),
        reversed,
        type: values.type,
      };

      const editTxReqConf = transactionApi.updateAccountOwnTransaction(
        transactionId,
        transaction,
        auth.accessToken
      );

      editTxRequest(editTxReqConf);
      actions.setSubmitting(false);
    }
  };

  const reverseTxHandler = () => {
    setReversed((prevState) => !prevState);
  };

  const validCurrentTx =
    currentTxData && currentTxError === null && currentTxStatus === 'completed';

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={6}>
          <div className="d-flex flex-column py-3">
            <div className="text-center mb-3">
              <h3>Edit Transaction</h3>
            </div>
            {validCurrentTx && (
              <Formik
                validationSchema={CreateEditTxFormInputSchema}
                onSubmit={editTransactionSubmitHandler}
                initialValues={editTxFormInitialValues}
                enableReinitialize
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
                    <div className="mb-5">
                      <RequestStatusMessage
                        className="mb-2"
                        data={editTxData}
                        error={editTxError}
                        loadingMessage="Updating Transaction..."
                        status={editTxStatus}
                        successMessage="Transaction updated!"
                      />
                      <h5 className="mb-3">Transaction info</h5>
                      <Form.Group
                        className="mb-3"
                        controlId="editTxFormUsername"
                      >
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
                      <Form.Group
                        className="mb-3"
                        controlId="editTxFormDateFinished"
                      >
                        <Form.Label>Date finished</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="dateFinished"
                          value={getDateFromZonedDateTimeString(
                            values.dateFinished
                          )}
                          isValid={touched.dateFinished && !errors.dateFinished}
                          isInvalid={
                            touched.dateFinished && !!errors.dateFinished
                          }
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.dateFinished}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="editTxFormType">
                        <Form.Label>Type</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder="Enter username"
                            name="type"
                            value={type}
                            isValid={touched.type && !errors.type}
                            isInvalid={touched.type && !!errors.type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            readOnly
                          />
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
                      <Button variant="primary" type="submit">
                        Save
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
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

export default EditTransaction;
