import { FormEventHandler, useEffect, useState } from 'react';
import { Form, Col, Container, Row, Button, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import TransactionApi, {
  CcToGoldTransaction,
  FileAttachment,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';

function CreateTransaction() {
  const auth = useSelector((state: IRootState) => state.auth);
  const [username, setUsername] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.CC2GOLD);
  const [ccAmount, setCcAmount] = useState(1);
  const [goldPerCC, setGoldPerCC] = useState(1);
  const [goldPaid, setGoldPaid] = useState(1);
  const [fileAttachments, setFileAttachment] = useState<FileAttachment[]>([]);

  const [name, setName] = useState('');
  const [phpPaid, setPhpPaid] = useState(1);
  const [goldPerPhp, setGoldPerPhp] = useState(1);
  const [methodOfPayment, setMethodOfPayment] = useState('');

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
      alert('Transaction successfully saved');
    }
  }, [createTxData, createTxError, createTxStatus]);

  const createTransactionSubmitHandler: FormEventHandler = (e) => {
    e.preventDefault();

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

    const createTxReqConf = TransactionApi.createAccountOwnTransactions(
      finalTransaction,
      auth.accessToken
    );

    createTxRequest(createTxReqConf);
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={8} md={6} lg={4}>
          <div className="d-flex flex-column py-3">
            <div className="text-center mb-3">
              <h3>Create Transaction</h3>
            </div>
            <Form onSubmit={createTransactionSubmitHandler}>
              <div className="mb-5">
                <h5 className="mb-3">Transaction info</h5>
                <Form.Group className="mb-3" controlId="createTxFormUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="createTxFormType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    aria-label="Transaction type"
                    onChange={(e) =>
                      setType(
                        e.currentTarget.value === 'CC2GOLD'
                          ? TransactionType.CC2GOLD
                          : TransactionType.GOLD2PHP
                      )
                    }
                  >
                    <option value={TransactionType.CC2GOLD}>CC to Gold</option>
                    <option value={TransactionType.GOLD2PHP}>
                      Gold to PHP
                    </option>
                  </Form.Select>
                </Form.Group>
                {type === TransactionType.GOLD2PHP && (
                  <>
                    <Form.Group className="mb-3" controlId="createTxFormName">
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
                      controlId="createTxFormPhpPaid"
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
                      controlId="createTxFormGoldPerPhp"
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
                      controlId="createTxFormMethodOfPayment"
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
                      controlId="createTxFormCcAmount"
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
                      controlId="createTxFormGoldPerCc"
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
                      controlId="createTxFormGoldPaid"
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
                                controlId={`createTxFormFile${index}Name`}
                              >
                                <Form.Control
                                  type="text"
                                  value={fileInput.fileName}
                                  placeholder={`File #${index + 1} name`}
                                  onChange={(e) => {
                                    setFileAttachment((prevState) => {
                                      const newState = [...prevState];
                                      newState[index].fileName = e.target.value;
                                      return newState;
                                    });
                                  }}
                                />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group
                                className="mb-3"
                                controlId={`createTxFormFile${index}Url`}
                              >
                                <Form.Control
                                  type="text"
                                  placeholder={`File #${index + 1} url`}
                                  value={fileInput.fileUrl}
                                  onChange={(e) => {
                                    setFileAttachment((prevState) => {
                                      const newState = [...prevState];
                                      newState[index].fileUrl = e.target.value;
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
                    <Stack direction="horizontal" gap={2}>
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
                        <>
                          <div className="vr" />
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
                        </>
                      )}
                    </Stack>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </Form>
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
