import { FormEventHandler, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import transactionApi, {
  CcToGoldTransaction,
  FileAttachment,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../api/transaction-api';
import useHttp from '../hooks/useHttp';
import { IRootState } from '../store';

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
      alert('Update successful');
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

  return (
    <div>
      <div>
        <h1>Edit Transaction</h1>
      </div>
      <div>
        <form onSubmit={editTransactionSubmitHandler}>
          <h3>Transaction info</h3>
          <div>
            <span>Username: </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <span>Transaction type: </span>
            <input value={type} name="type" type="text" readOnly />
          </div>
          {type === TransactionType.GOLD2PHP && (
            <div>
              <div>
                <span>Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <span>PHP paid</span>
                <input
                  type="number"
                  value={phpPaid}
                  onChange={(e) => setPhpPaid(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <span>Gold per PHP</span>
                <input
                  type="number"
                  value={goldPerPhp}
                  onChange={(e) => setGoldPerPhp(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <span>Method of payment</span>
                <input
                  type="text"
                  value={methodOfPayment}
                  onChange={(e) => setMethodOfPayment(e.target.value)}
                />
              </div>
            </div>
          )}
          {type === TransactionType.CC2GOLD && (
            <div>
              <div>
                <span>CC Amount</span>
                <input
                  type="number"
                  value={ccAmount}
                  onChange={(e) => setCcAmount(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <span>Gold per CC</span>
                <input
                  type="number"
                  value={goldPerCC}
                  onChange={(e) => setGoldPerCC(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <span>Gold paid</span>
                <input
                  type="number"
                  value={goldPaid}
                  onChange={(e) => setGoldPaid(parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
          <h3>File attachments</h3>
          {fileAttachments &&
            fileAttachments.length > 0 &&
            fileAttachments.map((fileInput, index) => {
              return (
                <div key={'File input ' + index}>
                  <div>
                    <span>File #{index + 1}</span>
                  </div>
                  <div>
                    <span>File name: </span>
                    <input
                      type="text"
                      value={fileInput.fileName}
                      onChange={(e) => {
                        setFileAttachment((prevState) => {
                          const newState = [...prevState];
                          newState[index].fileName = e.target.value;
                          return newState;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <span>File url: </span>
                    <input
                      type="text"
                      value={fileInput.fileUrl}
                      onChange={(e) => {
                        setFileAttachment((prevState) => {
                          const newState = [...prevState];
                          newState[index].fileUrl = e.target.value;
                          return newState;
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          <button
            type="button"
            onClick={() =>
              setFileAttachment((prevState) => {
                return [...prevState, { fileName: '', fileUrl: '' }];
              })
            }
          >
            Add file attachment
          </button>
          <br />
          <br />
          <div>
            <input type="submit" value="Update Transaction" />
          </div>
        </form>
        <div>
          <Link to={`/transactions/${transactionId}`}>
            Go back to transaction details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EditTransaction;
