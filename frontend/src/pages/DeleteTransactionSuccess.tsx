import React from 'react';
import { Link } from 'react-router-dom';

function DeleteTransactionSuccess() {
  return (
    <>
      <div>Transaction successfully deleted</div>
      <Link to="/">Go back to Home</Link>;
    </>
  );
}

export default DeleteTransactionSuccess;
