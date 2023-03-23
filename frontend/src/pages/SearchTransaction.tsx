import React, { FormEventHandler, useEffect, useState } from 'react';
import TransactionApi, { Transaction } from '../api/transaction-api';
import TransactionDetails from '../components/Transaction/TransactionDetails';
import useHttp from '../hooks/useHttp';

function SearchTransaction() {
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');

  const {
    data: transactionData,
    error: transactionError,
    sendRequest: transactionRequest,
    status: transactionStatus,
  } = useHttp<Transaction>(false);

  useEffect(() => {
    if (
      transactionData !== null &&
      transactionError === null &&
      transactionStatus === 'completed'
    ) {
      console.log(transactionData);
    }
  }, [transactionData, transactionError, transactionStatus]);

  const transactionSearchSubmitHandler: FormEventHandler = (e) => {
    e.preventDefault();

    const transactionSearchRequestConfig =
      TransactionApi.getTransactionByUsernameAndId(username, id);

    transactionRequest(transactionSearchRequestConfig);
  };

  return (
    <div>
      <div>
        <form onSubmit={transactionSearchSubmitHandler}>
          <div>
            <h1>Search for Transaction</h1>
          </div>
          <div>
            <span>Username: </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <span>Transaction id: </span>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div>
            <input type="submit" value="Search" />
          </div>
        </form>
      </div>
      {transactionData && (
        <TransactionDetails
          transaction={transactionData}
          key={transactionData.id}
        />
      )}
      {transactionStatus === 'completed' && transactionError !== null && (
        <h1>No result found</h1>
      )}
    </div>
  );
}

export default SearchTransaction;
