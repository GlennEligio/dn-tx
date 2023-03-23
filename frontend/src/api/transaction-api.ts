import { RequestConfig } from '../hooks/useHttp';

export enum TransactionType {
  CC2GOLD = 'CcToGold',
  GOLD2PHP = 'GoldToPhp',
}

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
}

export interface Transaction {
  id: string;
  username: string;
  dateFinished: string;
  fileAttachments: FileAttachment[];
  type: TransactionType;
}

export interface CcToGoldTransaction extends Transaction {
  ccAmount: number;
  goldPerCc: number;
  goldPaid: number;
}

export interface GoldToPhpTransaction extends Transaction {
  name: string;
  phpPaid: number;
  goldPerPhp: number;
  methodOfPayment: string;
}

const getBackendUri = () => {
  if (import.meta.env.DEV && import.meta.env.VITE_BACKEND_SERVICE_URI_DEV) {
    return import.meta.env.VITE_BACKEND_SERVICE_URI_DEV;
  }
  return '';
};

const BACKEND_URI = getBackendUri();

const getTransactionByUsernameAndId = (username: string, id: string) => {
  const searchParams = new URLSearchParams({ username, id }).toString();
  return {
    method: 'GET',
    relativeUrl: `${BACKEND_URI}/api/v1/transactions/search?${searchParams}`,
  };
};

const getAccountOwnTransactions = (accessToken: string): RequestConfig => {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'GET',
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/@self/transactions`,
  };
};

const createAccountOwnTransactions = <T extends Transaction>(
  transaction: T,
  accessToken: string
): RequestConfig => {
  return {
    body: transaction,
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/@self/transactions`,
  };
};

const updateAccountOwnTransaction = <T extends Transaction>(
  id: string,
  transaction: T,
  accessToken: string
): RequestConfig => {
  return {
    body: transaction,
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'PUT',
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/@self/transactions/${id}`,
  };
};

const deleteAccountOwnTransaction = (
  id: string,
  accessToken: string
): RequestConfig => {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'DELETE',
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/@self/transactions/${id}`,
  };
};

export default {
  createAccountOwnTransactions,
  getAccountOwnTransactions,
  updateAccountOwnTransaction,
  deleteAccountOwnTransaction,
  getTransactionByUsernameAndId,
};
