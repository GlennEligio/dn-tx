import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import transactionApi, {
  CcToGoldTransaction,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';

function TransactionDetails() {
  const { transactionId } = useParams();

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
  }, [transactionId]);

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

  const validTransactionData =
    transactionData &&
    transactionError === null &&
    transactionStatus === 'completed';

  return (
    <div>
      {validTransactionData && (
        <>
          <div>
            <h1>Transaction Details</h1>
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
                  CC Amount: {(transactionData as CcToGoldTransaction).ccAmount}
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
                  Gold paid: {(transactionData as CcToGoldTransaction).goldPaid}
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
                  Php paid: {(transactionData as GoldToPhpTransaction).phpPaid}
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
                  {(transactionData as GoldToPhpTransaction).methodOfPayment}
                </span>
              </div>
            </>
          )}
          <div>
            <h1>File attachments: </h1>
            {transactionData.fileAttachments &&
              transactionData.fileAttachments.length > 0 &&
              transactionData.fileAttachments.map((file) => (
                <a href={file.fileUrl} key={file.fileUrl}>
                  {file.fileName}
                </a>
              ))}
          </div>
        </>
      )}
      {!validTransactionData && (
        <div>No transaction for id {transactionId} found</div>
      )}
    </div>
  );
}

export default TransactionDetails;
