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
import * as yup from 'yup';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import transactionApi, {
  FileAttachment,
  Transaction,
  TransactionType,
  CcToGoldTransactionItem,
  GoldToPhpTransactionItem,
  ItemToGoldTransactionItem,
  TransactionItem,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import {
  getDateFromZonedDateTimeString,
  getZonedDateTimeFromDateString,
} from '../util/utils';
import TransactionItemsCarousel from '../components/Transactions/TransactionItemsCarousel';

interface EditTxFormInput {
  username: string;
  dateFinished: string;
  type: TransactionType;
  fileAttachments: FileAttachment[];
  transactionItems: TransactionItem[];
}

const editTxFormInputSchema = yup.object().shape({
  username: yup.string().required('Username is required.'),
  dateFinished: yup.date().notRequired(),
  type: yup
    .mixed()
    .oneOf(
      [
        TransactionType.CC2GOLD,
        TransactionType.GOLD2PHP,
        TransactionType.ITEM2GOLD,
      ],
      'Type can only be CC to GOLD, GOLD to PHP, ITEM to GOLD'
    ),
  fileAttachments: yup.array().of(
    yup.object().shape({
      fileName: yup.string().required('Required.'),
      fileUrl: yup.string().url('Must be a url').required('Required'),
    })
  ),
  transactionItems: yup.array().of(
    yup.object().shape({
      ccAmount: yup
        .number()
        .test(
          'CC2GOLD ccAmount test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.CC2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      goldPerCC: yup
        .number()
        .test(
          'CC2GOLD goldPerCC test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.CC2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      goldPaid: yup
        .number()
        .test(
          'CC2GOLD goldPaid test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.CC2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      name: yup
        .string()
        .test('GOLD2PHP name test', 'Required', (value, context) => {
          let isValid = true;
          const type = context.from && context.from[1].value.type;
          if (type === TransactionType.GOLD2PHP) {
            if (!value || value.length < 0) isValid = false;
          }
          return isValid;
        }),
      phpPaid: yup
        .number()
        .test(
          'GOLD2PHP phpPaid test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.GOLD2PHP) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      goldPerPhp: yup
        .number()
        .test(
          'GOLD2PHP goldPerPhp test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.GOLD2PHP) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      methodOfPayment: yup
        .string()
        .test('GOLD2PHP methodOfPayment test', 'Required', (value, context) => {
          let isValid = true;
          const type = context.from && context.from[1].value.type;
          if (type === TransactionType.GOLD2PHP) {
            if (!value || value.length < 0) isValid = false;
          }
          return isValid;
        }),
      itemName: yup
        .string()
        .test('ITEM2GOLD itemName test', 'Required', (value, context) => {
          let isValid = true;
          const type = context.from && context.from[1].value.type;
          if (type === TransactionType.ITEM2GOLD) {
            if (!value || value.length < 0) isValid = false;
          }
          return isValid;
        }),
      itemQuantity: yup
        .number()
        .test(
          'ITEM2GOLD itemQuantity test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.ITEM2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      itemPriceInGold: yup
        .number()
        .test(
          'ITEM2GOLD itemPriceInGold test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.ITEM2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
    })
  ),
});

function EditTransaction() {
  const auth = useSelector((state: IRootState) => state.auth);
  const { transactionId } = useParams();

  // General Transaction inputs
  const [username, setUsername] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.CC2GOLD);
  const [dateFinished, setDateFinished] = useState('');
  const [fileAttachments, setFileAttachment] = useState<FileAttachment[]>([]);
  const [reversed, setReversed] = useState(false);

  // TransactionItems
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>(
    []
  );

  // initial form input values
  const editTxFormInitialValues: EditTxFormInput = {
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
      setFileAttachment(currentTxData.fileAttachments);
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

  // Checking the result of edit transaction request
  useEffect(() => {
    if (editTxData && editTxError === null && editTxStatus === 'completed') {
      console.log(editTxData);
    }
  }, [editTxData, editTxError, editTxStatus]);

  // Edit Transcation form submit handler
  const editTransactionSubmitHandler = (
    values: EditTxFormInput,
    actions: FormikHelpers<EditTxFormInput>
  ) => {
    console.log('sending');
    console.log(values);
    console.log(getZonedDateTimeFromDateString(values.dateFinished));
    if (transactionId) {
      const transaction: Transaction = {
        username: values.username,
        dateFinished: getZonedDateTimeFromDateString(values.dateFinished),
        fileAttachments: values.fileAttachments,
        creator: {
          username: auth.username,
        },
        transactionItems,
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
                validationSchema={editTxFormInputSchema}
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
                          <Form.Select
                            aria-label="Transaction type"
                            name="type"
                            value={values.type}
                            isValid={touched.type && !errors.type}
                            isInvalid={touched.type && !!errors.type}
                            onChange={handleChange}
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
                        txType={type}
                        key="transaction-carousel"
                        readOnly={false}
                        setNewTxItems={setTransactionItems}
                        values={values}
                        touched={touched}
                        errors={errors}
                      />
                    </div>
                    <div className="mb-3">
                      <h5>File attachments</h5>
                      <div>
                        <FieldArray
                          name="fileAttachments"
                          render={(arrayHelpers) => (
                            <>
                              {values.fileAttachments &&
                                values.fileAttachments.length > 0 &&
                                values.fileAttachments.map(
                                  (fileInput, index) => {
                                    const nameInput = `fileAttachments[${index}].fileName`;
                                    const urlInput = `fileAttachments[${index}].fileUrl`;
                                    const nameError = getIn(errors, nameInput);
                                    const nameTouch = getIn(touched, nameInput);
                                    const urlError = getIn(errors, urlInput);
                                    const urlTouch = getIn(touched, urlInput);

                                    return (
                                      <div key={`File input ${index}`}>
                                        <div>
                                          <b>File #{index + 1}</b>
                                        </div>
                                        <Row>
                                          <Col>
                                            <Form.Group
                                              className="mb-3"
                                              controlId={`editTxFormFile${index}Name`}
                                            >
                                              <Form.Control
                                                type="text"
                                                placeholder={`File #${
                                                  index + 1
                                                } name`}
                                                name={nameInput}
                                                value={fileInput.fileName}
                                                isValid={
                                                  nameTouch && !nameError
                                                }
                                                isInvalid={
                                                  nameTouch && !!nameError
                                                }
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                              />
                                              <Form.Control.Feedback type="invalid">
                                                {nameError}
                                              </Form.Control.Feedback>
                                            </Form.Group>
                                          </Col>
                                          <Col>
                                            <Form.Group
                                              className="mb-3"
                                              controlId={`editTxFormFile${index}Url`}
                                            >
                                              <Form.Control
                                                type="text"
                                                placeholder={`File #${
                                                  index + 1
                                                } url`}
                                                name={urlInput}
                                                value={fileInput.fileUrl}
                                                isValid={urlTouch && !urlError}
                                                isInvalid={
                                                  urlTouch && !!urlError
                                                }
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                              />
                                              <Form.Control.Feedback type="invalid">
                                                {urlError}
                                              </Form.Control.Feedback>
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                      </div>
                                    );
                                  }
                                )}
                              <div className="d-flex justify-content-center">
                                <Stack direction="horizontal" gap={2}>
                                  <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => {
                                      arrayHelpers.push({
                                        fileName: '',
                                        fileUrl: '',
                                      });
                                    }}
                                  >
                                    Add
                                  </Button>
                                  {values.fileAttachments &&
                                    values.fileAttachments.length > 0 && (
                                      <>
                                        <div className="vr" />
                                        <Button
                                          variant="secondary"
                                          type="button"
                                          onClick={() => {
                                            arrayHelpers.pop();
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </>
                                    )}
                                </Stack>
                              </div>
                            </>
                          )}
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
