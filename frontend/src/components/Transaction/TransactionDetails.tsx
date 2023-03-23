import {
  CcToGoldTransaction,
  GoldToPhpTransaction,
  Transaction,
  TransactionType,
} from '../../api/transaction-api';

interface TransactionDetailsProps {
  transaction: Transaction;
}

function TransactionDetails({ transaction }: TransactionDetailsProps) {
  return (
    <div>
      <div>
        <h1>Transaction Details</h1>
      </div>
      <div>
        <span>Transaction id: {transaction.id}</span>
      </div>
      <div>
        <span>Username: {transaction.username}</span>
      </div>
      <div>
        <span>Date finished: {transaction.dateFinished}</span>
      </div>
      <div>
        <span>Transaction type: {transaction.type}</span>
      </div>
      {transaction.type === TransactionType.CC2GOLD && (
        <>
          <div>
            <span>
              CC Amount: {(transaction as CcToGoldTransaction).ccAmount}
            </span>
          </div>
          <div>
            <span>
              Gold per CC ratio:{' '}
              {(transaction as CcToGoldTransaction).goldPerCc}
            </span>
          </div>
          <div>
            <span>
              Gold paid: {(transaction as CcToGoldTransaction).goldPaid}
            </span>
          </div>
        </>
      )}
      {transaction.type === TransactionType.GOLD2PHP && (
        <>
          <div>
            <span>Name: {(transaction as GoldToPhpTransaction).name}</span>
          </div>
          <div>
            <span>
              Php paid: {(transaction as GoldToPhpTransaction).phpPaid}
            </span>
          </div>
          <div>
            <span>
              Gold per php: {(transaction as GoldToPhpTransaction).goldPerPhp}
            </span>
          </div>
          <div>
            <span>
              Method of payment:{' '}
              {(transaction as GoldToPhpTransaction).methodOfPayment}
            </span>
          </div>
        </>
      )}
      <div>
        <h1>File attachments: </h1>
        {transaction.fileAttachments &&
          transaction.fileAttachments.length > 0 &&
          transaction.fileAttachments.map((file) => (
            <a href={file.fileUrl} key={file.fileUrl}>
              {file.fileName}
            </a>
          ))}
      </div>
    </div>
  );
}

export default TransactionDetails;
