import { MouseEventHandler, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import transactionApi from '../../api/transaction-api';
import useHttp from '../../hooks/useHttp';
import { IRootState } from '../../store';

interface DeleteTransactionModalProps {
  show: boolean;
  handleClose: () => void;
  transactionId: string;
  redirectUrl: string;
}

function DeleteTransactionModal({
  show,
  handleClose,
  transactionId,
  redirectUrl,
}: DeleteTransactionModalProps) {
  const auth = useSelector((state: IRootState) => state.auth);
  const navigate = useNavigate();

  // useHttp for deleting the transaction data of specific id
  const {
    error: deleteTxError,
    status: deleteTxStatus,
    sendRequest: deleteTxRequest,
  } = useHttp<boolean>(false);

  // Checks the result of delete transaction request
  useEffect(() => {
    if (deleteTxError === null && deleteTxStatus === 'completed') {
      navigate(redirectUrl);
    }
  }, [deleteTxError, deleteTxStatus, navigate, redirectUrl]);

  const deleteTxHandler: MouseEventHandler = (e) => {
    if (transactionId) {
      const deleteOwnTxReqConf = transactionApi.deleteAccountOwnTransaction(
        transactionId,
        auth.accessToken
      );
      deleteTxRequest(deleteOwnTxReqConf);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>Do you want to delete this transaction?</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="danger" onClick={deleteTxHandler}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteTransactionModal;
