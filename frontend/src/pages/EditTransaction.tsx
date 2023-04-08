import { FormEventHandler, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Stack } from 'react-bootstrap';
import { FieldArray, Formik, FormikHelpers, getIn } from 'formik';
import * as yup from 'yup';
import transactionApi, {
  CcToGoldTransaction,
  FileAttachment,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import RequestStatusMessage from '../components/Transactions/RequestStatusMessage';

interface EditTxFormInput {
  username: string;
  type: TransactionType;
  fileAttachments: FileAttachment[];
  ccAmount: number;
  goldPerCC: number;
  goldPaid: number;
  name: string;
  phpPaid: number;
  goldPerPhp: number;
  methodOfPayment: string;
}

const editTxFormInputSchema = yup.object().shape({
  username: yup.string().required('Username is required.'),
  type: yup
    .mixed()
    .oneOf(
      [TransactionType.CC2GOLD, TransactionType.GOLD2PHP],
      'Type can only be CC to GOLD or GOLD to PHP'
    ),
  fileAttachments: yup.array().of(
    yup.object().shape({
      fileName: yup.string().required('Required.'),
      fileUrl: yup.string().url('Must be a url').required('Required'),
    })
  ),
  ccAmount: yup.number().when('type', {
    is: TransactionType.CC2GOLD,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  goldPerCC: yup.number().when('type', {
    is: TransactionType.CC2GOLD,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  goldPaid: yup.number().when('type', {
    is: TransactionType.CC2GOLD,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  name: yup.string().when('type', {
    is: TransactionType.GOLD2PHP,
    then: (schema) => schema.required('Name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  phpPaid: yup.number().when('type', {
    is: TransactionType.GOLD2PHP,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  goldPerPhp: yup.number().when('type', {
    is: TransactionType.GOLD2PHP,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  methodOfPayment: yup.string().when('type', {
    is: TransactionType.GOLD2PHP,
    then: (schema) => schema.required('Method of payment is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

function EditTransaction() {
  const auth = useSelector((state: IRootState) => state.auth);
  const { transactionId } = useParams();

  // General Transaction inputs
  const [username, setUsername] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.CC2GOLD);
  const [fileAttachments, setFileAttachment] = useState<FileAttachment[]>([]);

  // For CcToGoldTransaction
  const [ccAmount, setCcAmount] = useState(1);
  const [goldPerCC, setGoldPerCC] = useState(1);
  const [goldPaid, setGoldPaid] = useState(1);

  // For GoldToPhpTransactions
  const [name, setName] = useState('');
  const [phpPaid, setPhpPaid] = useState(1);
  const [goldPerPhp, setGoldPerPhp] = useState(1);
  const [methodOfPayment, setMethodOfPayment] = useState('');

  // initial form input values
  const editTxFormInitialValues: EditTxFormInput = {
    username,
    type,
    fileAttachments,
    ccAmount,
    goldPaid,
    goldPerCC,
    name,
    phpPaid,
    goldPerPhp,
    methodOfPayment,
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
  }, [transactionId]);

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
      setFileAttachment(currentTxData.fileAttachments);

      if (currentTxData.type === TransactionType.CC2GOLD) {
        const ccToGoldTx = currentTxData as CcToGoldTransaction;
        setCcAmount(ccToGoldTx.ccAmount);
        setGoldPerCC(ccToGoldTx.goldPerCC);
        setGoldPaid(ccToGoldTx.goldPaid);
      }

      if (currentTxData.type === TransactionType.GOLD2PHP) {
        const goldToPhpTx = currentTxData as GoldToPhpTransaction;
        setName(goldToPhpTx.name);
        setPhpPaid(goldToPhpTx.phpPaid);
        setGoldPerPhp(goldToPhpTx.goldPerPhp);
        setMethodOfPayment(goldToPhpTx.methodOfPayment);
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
    if (transactionId) {
      const transaction: Transaction = {
        username: values.username,
        fileAttachments: values.fileAttachments,
        creator: {
          username: auth.username,
        },
        type: values.type,
      };

      let finalTransaction = null;

      switch (type) {
        case TransactionType.CC2GOLD:
          finalTransaction = {
            ...transaction,
            ccAmount: values.ccAmount,
            goldPaid: values.goldPaid,
            goldPerCC: values.goldPerCC,
          } as CcToGoldTransaction;
          break;
        case TransactionType.GOLD2PHP:
          finalTransaction = {
            ...transaction,
            goldPerPhp: values.goldPerPhp,
            methodOfPayment: values.methodOfPayment,
            name: values.name,
            phpPaid: values.phpPaid,
          } as GoldToPhpTransaction;
          break;
        default:
          finalTransaction = transaction;
      }

      const editTxReqConf = transactionApi.updateAccountOwnTransaction(
        transactionId,
        finalTransaction,
        auth.accessToken
      );

      editTxRequest(editTxReqConf);
      actions.setSubmitting(false);
    }
  };

  const validCurrentTx =
    currentTxData && currentTxError === null && currentTxStatus === 'completed';

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6}>
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
                      <Form.Group className="mb-3" controlId="editTxFormType">
                        <Form.Label>Type</Form.Label>
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
                            CC to Gold
                          </option>
                          <option value={TransactionType.GOLD2PHP}>
                            Gold to PHP
                          </option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.type}
                        </Form.Control.Feedback>
                      </Form.Group>
                      {values.type === TransactionType.GOLD2PHP && (
                        <>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormName"
                          >
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter name"
                              name="name"
                              value={values.name}
                              isValid={touched.name && !errors.name}
                              isInvalid={touched.name && !!errors.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormPhpPaid"
                          >
                            <Form.Label>PHP paid</Form.Label>
                            <Form.Control
                              type="number"
                              name="phpPaid"
                              value={values.phpPaid}
                              isValid={touched.phpPaid && !errors.phpPaid}
                              isInvalid={touched.phpPaid && !!errors.phpPaid}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.phpPaid}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormGoldPerPhp"
                          >
                            <Form.Label>Gold per PHP</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              placeholder="Enter gold to php ratio"
                              name="goldPerPhp"
                              value={values.goldPerPhp}
                              isValid={touched.goldPerPhp && !errors.goldPerPhp}
                              isInvalid={
                                touched.goldPerPhp && !!errors.goldPerPhp
                              }
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.goldPerPhp}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormMethodOfPayment"
                          >
                            <Form.Label>Method of payment</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter method of payment"
                              name="methodOfPayment"
                              value={values.methodOfPayment}
                              isValid={
                                touched.methodOfPayment &&
                                !errors.methodOfPayment
                              }
                              isInvalid={
                                touched.methodOfPayment &&
                                !!errors.methodOfPayment
                              }
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.methodOfPayment}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </>
                      )}
                      {values.type === TransactionType.CC2GOLD && (
                        <>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormCcAmount"
                          >
                            <Form.Label>CC Amount</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              placeholder="Enter CC amount"
                              name="ccAmount"
                              value={values.ccAmount}
                              isValid={touched.ccAmount && !errors.ccAmount}
                              isInvalid={touched.ccAmount && !!errors.ccAmount}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.ccAmount}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormGoldPerCc"
                          >
                            <Form.Label>Gold per CC</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              placeholder="Enter gold to cc ratio"
                              name="goldPerCC"
                              value={values.goldPerCC}
                              isValid={touched.goldPerCC && !errors.goldPerCC}
                              isInvalid={
                                touched.goldPerCC && !!errors.goldPerCC
                              }
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.goldPerCC}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="editTxFormGoldPaid"
                          >
                            <Form.Label>Gold paid</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              placeholder="Enter gold paid"
                              name="goldPaid"
                              value={values.goldPaid}
                              isValid={touched.goldPaid && !errors.goldPaid}
                              isInvalid={touched.goldPaid && !!errors.goldPaid}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.goldPaid}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </>
                      )}
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
                                  {values.fileAttachments.length > 0 && (
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
