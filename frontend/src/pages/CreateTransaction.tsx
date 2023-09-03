import { useEffect, useState } from 'react';
import {
  Form,
  Col,
  Container,
  Row,
  Button,
  Stack,
  InputGroup,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FieldArray, Formik, FormikHelpers, getIn } from 'formik';
import * as yup from 'yup';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import TransactionApi, {
  CcToGoldTransaction,
  FileAttachment,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import { getZonedDateTimeFromDateString } from '../util/utils';

interface CreateTxFormInput {
  username: string;
  type: TransactionType;
  fileAttachments: FileAttachment[];
  reversed: boolean;
  ccAmount: number;
  goldPerCC: number;
  goldPaid: number;
  name: string;
  phpPaid: number;
  goldPerPhp: number;
  methodOfPayment: string;
  itemName: string;
  itemQuantity: number;
  itemPriceInGold: number;
  dateFinished: string;
}

const createTxFormInputSchema = yup.object().shape({
  username: yup.string().required('Username is required.'),
  type: yup
    .mixed()
    .oneOf(
      [
        TransactionType.CC2GOLD,
        TransactionType.GOLD2PHP,
        TransactionType.ITEM2GOLD,
      ],
      'Type can only be CC2GOLD, GOLD2PHP, or ITEM2GOLD'
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
  itemName: yup.string().when('type', {
    is: TransactionType.ITEM2GOLD,
    then: (schema) => schema.required('Item name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  itemQuantity: yup.number().when('type', {
    is: TransactionType.ITEM2GOLD,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  itemPriceInGold: yup.number().when('type', {
    is: TransactionType.ITEM2GOLD,
    then: (schema) =>
      schema.min(1, 'Must be greater than 1').required('Required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  dateFinished: yup.date().notRequired(),
});

function CreateTransaction() {
  const auth = useSelector((state: IRootState) => state.auth);
  const [reversed, setReversed] = useState(false);

  const createTxFormInitialValues: CreateTxFormInput = {
    username: '',
    type: TransactionType.CC2GOLD,
    fileAttachments: [],
    reversed,
    ccAmount: 1,
    goldPaid: 1,
    goldPerCC: 1,
    name: '',
    phpPaid: 1,
    goldPerPhp: 1,
    methodOfPayment: '',
    itemName: '',
    itemQuantity: 1,
    itemPriceInGold: 1,
    dateFinished: '',
  };

  const {
    data: createTxData,
    error: createTxError,
    sendRequest: createTxRequest,
    status: createTxStatus,
  } = useHttp<Transaction>(false);

  useEffect(() => {
    if (
      createTxData &&
      createTxError === null &&
      createTxStatus === 'completed'
    ) {
      console.log(createTxData);
    }
  }, [createTxData, createTxError, createTxStatus]);

  const createTransactionSubmitHandler = (
    values: CreateTxFormInput,
    actions: FormikHelpers<CreateTxFormInput>
  ) => {
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
    };

    let finalTransaction = null;

    switch (values.type) {
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
      case TransactionType.ITEM2GOLD:
        finalTransaction = {
          ...transaction,
          itemName: values.itemName,
          itemQuantity: values.itemQuantity,
          itemPriceInGold: values.itemPriceInGold,
        };
        break;
      default:
        finalTransaction = transaction;
    }

    const createTxReqConf = TransactionApi.createAccountOwnTransactions(
      finalTransaction,
      auth.accessToken
    );

    createTxRequest(createTxReqConf);
  };

  const reverseTxHandler = () => {
    setReversed((prevState) => !prevState);
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
              validationSchema={createTxFormInputSchema}
              onSubmit={createTransactionSubmitHandler}
              initialValues={createTxFormInitialValues}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                    {values.type === TransactionType.GOLD2PHP && (
                      <>
                        <Form.Group
                          className="mb-3"
                          controlId="createTxFormName"
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
                          controlId="createTxFormPhpPaid"
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
                          controlId="createTxFormGoldPerPhp"
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
                          controlId="createTxFormMethodOfPayment"
                        >
                          <Form.Label>Method of payment</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter method of payment"
                            name="methodOfPayment"
                            value={values.methodOfPayment}
                            isValid={
                              touched.methodOfPayment && !errors.methodOfPayment
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
                          controlId="createTxFormCcAmount"
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
                          controlId="createTxFormGoldPerCc"
                        >
                          <Form.Label>Gold per CC</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Enter gold to cc ratio"
                            name="goldPerCC"
                            value={values.goldPerCC}
                            isValid={touched.goldPerCC && !errors.goldPerCC}
                            isInvalid={touched.goldPerCC && !!errors.goldPerCC}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.goldPerCC}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="createTxFormGoldPaid"
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
                    {values.type === TransactionType.ITEM2GOLD && (
                      <>
                        <Form.Group
                          className="mb-3"
                          controlId="createTxFormItemName"
                        >
                          <Form.Label>Item name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter item name"
                            name="itemName"
                            value={values.itemName}
                            isValid={touched.itemName && !errors.itemName}
                            isInvalid={touched.itemName && !!errors.itemName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.itemName}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="createTxFormItemQuantity"
                        >
                          <Form.Label>Item quantity</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Enter item quantity"
                            name="itemQuantity"
                            value={values.itemQuantity}
                            isValid={
                              touched.itemQuantity && !errors.itemQuantity
                            }
                            isInvalid={
                              touched.itemQuantity && !!errors.itemQuantity
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.itemQuantity}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="createTxFormItemPriceInGold"
                        >
                          <Form.Label>Item price in gold</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="Enter item price in gold"
                            name="itemPriceInGold"
                            value={values.itemPriceInGold}
                            isValid={
                              touched.itemPriceInGold && !errors.itemPriceInGold
                            }
                            isInvalid={
                              touched.itemPriceInGold &&
                              !!errors.itemPriceInGold
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.itemPriceInGold}
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
                              values.fileAttachments.map((fileInput, index) => {
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
                                          controlId={`createTxFormFile${index}Name`}
                                        >
                                          <Form.Control
                                            type="text"
                                            placeholder={`File #${
                                              index + 1
                                            } name`}
                                            name={nameInput}
                                            value={fileInput.fileName}
                                            isValid={nameTouch && !nameError}
                                            isInvalid={nameTouch && !!nameError}
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
                                          controlId={`createTxFormFile${index}Url`}
                                        >
                                          <Form.Control
                                            type="text"
                                            placeholder={`File #${
                                              index + 1
                                            } url`}
                                            name={urlInput}
                                            value={fileInput.fileUrl}
                                            isValid={urlTouch && !urlError}
                                            isInvalid={urlTouch && !!urlError}
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
                              })}
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
