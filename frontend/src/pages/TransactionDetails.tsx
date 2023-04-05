import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Col, Row, Container, Form, Stack, Button } from 'react-bootstrap';
import transactionApi, {
  CcToGoldTransaction,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../api/transaction-api';
import DeleteTransactionModal from '../components/modals/DeleteTransactionModal';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';

function TransactionDetails() {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // useHttp for fetching the transaction data of specific id
  const {
    data: transactionData,
    error: transactionError,
    status: transactionStatus,
    sendRequest: transactionRequest,
  } = useHttp<Transaction>(false);

  // Fetches the transaction data using the transaction id from path params
  useEffect(() => {
    if (transactionId) {
      const getTransactionByIdReqConf =
        transactionApi.getTransactionById(transactionId);
      transactionRequest(getTransactionByIdReqConf);
    }
  }, [transactionId, transactionRequest]);

  // Checks the transactionData
  useEffect(() => {
    if (
      transactionData &&
      transactionError === null &&
      transactionStatus === 'completed'
    ) {
      console.log(transactionData);
    }
  }, [transactionData, transactionError, transactionStatus]);

  const deleteTxModalShowHandler = () => {
    setShowDeleteModal(true);
  };

  const deleteTxModalCloseHandler = () => {
    setShowDeleteModal(false);
  };

  const validTransactionData =
    transactionData &&
    transactionError === null &&
    transactionStatus === 'completed';

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={8}>
          <div className="d-flex flex-column py-3">
            <div className="text-center mb-3">
              <h3>Transaction Details</h3>
            </div>
            {validTransactionData && (
              <div className="mb-5">
                <Form>
                  <div className="mb-5">
                    <h5 className="mb-3">Transaction info</h5>
                    <Form.Group className="mb-3" controlId="txDetailsUsername">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter username"
                        readOnly
                        value={transactionData.username}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="txDetailsType">
                      <Form.Label>Type</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter type"
                        readOnly
                        value={transactionData.type}
                      />
                    </Form.Group>
                    {transactionData.type === TransactionType.GOLD2PHP && (
                      <>
                        <Form.Group
                          className="mb-3"
                          controlId="createTxFormName"
                        >
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter name"
                            readOnly
                            value={
                              (transactionData as GoldToPhpTransaction).name
                            }
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
                            readOnly
                            value={
                              (transactionData as GoldToPhpTransaction).phpPaid
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
                            readOnly
                            value={
                              (transactionData as GoldToPhpTransaction)
                                .goldPerPhp
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
                            readOnly
                            value={
                              (transactionData as GoldToPhpTransaction)
                                .methodOfPayment
                            }
                          />
                        </Form.Group>
                      </>
                    )}
                    {transactionData.type === TransactionType.CC2GOLD && (
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
                            readOnly
                            value={
                              (transactionData as CcToGoldTransaction).ccAmount
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
                            readOnly
                            value={
                              (transactionData as CcToGoldTransaction).goldPerCC
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
                            readOnly
                            value={
                              (transactionData as CcToGoldTransaction).goldPaid
                            }
                          />
                        </Form.Group>
                      </>
                    )}
                  </div>
                  <div className="mb-3">
                    <h5>File attachments</h5>
                    <div>
                      {transactionData.fileAttachments &&
                        transactionData.fileAttachments.length > 0 &&
                        transactionData.fileAttachments.map(
                          (fileInput, index) => {
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
                                        readOnly
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
                                        readOnly
                                        value={fileInput.fileUrl}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </div>
                            );
                          }
                        )}
                    </div>
                  </div>
                  {auth.accessToken && (
                    <div className="d-flex justify-content-end">
                      <Stack direction="vertical" gap={3}>
                        <Button
                          onClick={() =>
                            navigate(`/transactions/${transactionId}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={deleteTxModalShowHandler}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </div>
                  )}
                </Form>
              </div>
            )}
            {!validTransactionData && transactionId && (
              <div className="mb-5">
                <div>No transaction for id {transactionId} found</div>
              </div>
            )}
            <div className="text-center mt-auto">
              <Link to="/">Back to Home</Link>
            </div>
          </div>
        </Col>
        <Col />
      </Row>
      <Row>
        <Col>
          {transactionId && (
            <DeleteTransactionModal
              handleClose={deleteTxModalCloseHandler}
              transactionId={transactionId}
              show={showDeleteModal}
              key={transactionId}
              redirectUrl="/transactions/delete/success"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default TransactionDetails;
