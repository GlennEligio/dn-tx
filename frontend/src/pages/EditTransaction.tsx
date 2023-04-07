import { FormEventHandler, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Stack } from 'react-bootstrap';
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
  const editTransactionSubmitHandler: FormEventHandler = (e) => {
    e.preventDefault();

    if (transactionId) {
      const transaction: Transaction = {
        username,
        fileAttachments,
        creator: {
          username: auth.username,
        },
        type,
      };

      let finalTransaction = null;

      switch (type) {
        case TransactionType.CC2GOLD:
          finalTransaction = {
            ...transaction,
            ccAmount,
            goldPaid,
            goldPerCC,
          } as CcToGoldTransaction;
          break;
        case TransactionType.GOLD2PHP:
          finalTransaction = {
            ...transaction,
            goldPerPhp,
            methodOfPayment,
            name,
            phpPaid,
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
    }
  };

  const validCurrentTx =
    currentTxData && currentTxError === null && currentTxStatus === 'completed';

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={8} md={6} lg={4}>
          <div className="d-flex flex-column py-3">
            {validCurrentTx && (
              <Form onSubmit={editTransactionSubmitHandler} className="mb-4">
                <div className="text-center mb-3">
                  <h3>Edit Transaction</h3>
                </div>
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
                  <Form.Group className="mb-3" controlId="editTxFormUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="editTxFormUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={currentTxData.type}
                      readOnly
                    />
                  </Form.Group>
                  {type === TransactionType.GOLD2PHP && (
                    <>
                      <Form.Group className="mb-3" controlId="editTxFormName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="editTxFormPhpPaid"
                      >
                        <Form.Label>PHP paid</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          placeholder="Enter php amount"
                          value={phpPaid}
                          onChange={(e) =>
                            setPhpPaid(parseFloat(e.target.value || '1'))
                          }
                        />
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
                          value={goldPerPhp}
                          onChange={(e) =>
                            setGoldPerPhp(parseFloat(e.target.value || '1'))
                          }
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="editTxFormMethodOfPayment"
                      >
                        <Form.Label>Method of payment</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter method of payment"
                          value={methodOfPayment}
                          onChange={(e) => setMethodOfPayment(e.target.value)}
                        />
                      </Form.Group>
                    </>
                  )}
                  {type === TransactionType.CC2GOLD && (
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
                          value={ccAmount}
                          onChange={(e) =>
                            setCcAmount(parseFloat(e.target.value || '1'))
                          }
                        />
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
                          value={goldPerCC}
                          onChange={(e) =>
                            setGoldPerCC(parseFloat(e.target.value || '1'))
                          }
                        />
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
                          value={goldPaid}
                          onChange={(e) =>
                            setGoldPaid(parseFloat(e.target.value || '1'))
                          }
                        />
                      </Form.Group>
                    </>
                  )}
                </div>
                <div className="mb-3">
                  <h5>File attachments</h5>
                  <div>
                    {fileAttachments &&
                      fileAttachments.length > 0 &&
                      fileAttachments.map((fileInput, index) => {
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
                                    value={fileInput.fileName}
                                    placeholder={`File #${index + 1} name`}
                                    onChange={(e) => {
                                      setFileAttachment((prevState) => {
                                        const newState = [...prevState];
                                        newState[index].fileName =
                                          e.target.value;
                                        return newState;
                                      });
                                    }}
                                  />
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group
                                  className="mb-3"
                                  controlId={`editTxFormFile${index}Url`}
                                >
                                  <Form.Control
                                    type="text"
                                    placeholder={`File #${index + 1} url`}
                                    value={fileInput.fileUrl}
                                    onChange={(e) => {
                                      setFileAttachment((prevState) => {
                                        const newState = [...prevState];
                                        newState[index].fileUrl =
                                          e.target.value;
                                        return newState;
                                      });
                                    }}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        );
                      })}
                    <div className="d-flex justify-content-center">
                      <Stack gap={2} className="w-100">
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() =>
                            setFileAttachment((prevState) => {
                              return [
                                ...prevState,
                                { fileName: '', fileUrl: '' },
                              ];
                            })
                          }
                        >
                          Add
                        </Button>
                        {fileAttachments.length > 0 && (
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() =>
                              setFileAttachment((prevState) => {
                                const newFiles = [...prevState];
                                newFiles.pop();
                                return newFiles;
                              })
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </Stack>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <Button className="w-100" variant="primary" type="submit">
                    Save
                  </Button>
                </div>
              </Form>
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
