import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Col, Row, Container } from 'react-bootstrap';
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
        <Col xs={8} className="vh-100 py-3 d-flex flex-column">
          {validTransactionData && (
            <>
              <div className="text-center">
                <h3>Transaction Details</h3>
              </div>
              <div>
                <span>Transaction id: {transactionData.id}</span>
              </div>
              <div>
                <span>Username: {transactionData.username}</span>
              </div>
              <div>
                <span>Date finished: {transactionData.dateFinished}</span>
              </div>
              <div>
                <span>Transaction type: {transactionData.type}</span>
              </div>
              {transactionData.type === TransactionType.CC2GOLD && (
                <>
                  <div>
                    <span>
                      CC Amount:{' '}
                      {(transactionData as CcToGoldTransaction).ccAmount}
                    </span>
                  </div>
                  <div>
                    <span>
                      Gold per CC ratio:{' '}
                      {(transactionData as CcToGoldTransaction).goldPerCC}
                    </span>
                  </div>
                  <div>
                    <span>
                      Gold paid:{' '}
                      {(transactionData as CcToGoldTransaction).goldPaid}
                    </span>
                  </div>
                </>
              )}
              {transactionData.type === TransactionType.GOLD2PHP && (
                <>
                  <div>
                    <span>
                      Name: {(transactionData as GoldToPhpTransaction).name}
                    </span>
                  </div>
                  <div>
                    <span>
                      Php paid:{' '}
                      {(transactionData as GoldToPhpTransaction).phpPaid}
                    </span>
                  </div>
                  <div>
                    <span>
                      Gold per php:{' '}
                      {(transactionData as GoldToPhpTransaction).goldPerPhp}
                    </span>
                  </div>
                  <div>
                    <span>
                      Method of payment:{' '}
                      {
                        (transactionData as GoldToPhpTransaction)
                          .methodOfPayment
                      }
                    </span>
                  </div>
                </>
              )}
              <div>
                <h1>File attachments: </h1>
                {transactionData.fileAttachments &&
                  transactionData.fileAttachments.length > 0 &&
                  transactionData.fileAttachments.map((file) => (
                    <div key={file.fileUrl}>
                      <a href={file.fileUrl}>{file.fileName}</a>
                    </div>
                  ))}
              </div>
              {auth.accessToken && (
                <>
                  <div>
                    <button type="button" onClick={deleteTxModalShowHandler}>
                      Delete
                    </button>
                  </div>
                  <div>
                    <Link to={`/transactions/${transactionId}/edit`}>Edit</Link>
                  </div>
                </>
              )}
            </>
          )}
          {!validTransactionData && transactionId && (
            <div>No transaction for id {transactionId} found</div>
          )}
          {transactionId && (
            <DeleteTransactionModal
              handleClose={deleteTxModalCloseHandler}
              transactionId={transactionId}
              show={showDeleteModal}
              key={transactionId}
              redirectUrl="/transactions/delete/success"
            />
          )}
          <br />
          <div>
            <Link to="/">Go back to Home</Link>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default TransactionDetails;
