import { FormEventHandler, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
      console.log(createTxData);
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
    <div>
      <div>
        <h1>Create Transaction</h1>
      </div>
      <div>
        <form onSubmit={createTransactionSubmitHandler}>
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
            <select
              name="type"
              onChange={(e) =>
                setType(
                  e.currentTarget.value === 'CC2GOLD'
                    ? TransactionType.CC2GOLD
                    : TransactionType.GOLD2PHP
                )
              }
            >
              <option value="CC2GOLD">CC to Gold</option>
              <option value="GOLD2PHP">Gold to PHP</option>
            </select>
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
            <input type="submit" value="Create Transaction" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTransaction;
