import * as yup from 'yup';
import { RequestConfig } from '../hooks/useHttp';

export enum TransactionType {
  CC2GOLD = 'CC2GOLD',
  GOLD2PHP = 'GOLD2PHP',
  ITEM2GOLD = 'ITEM2GOLD',
}

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
}

export interface Transaction {
  id?: string;
  username: string;
  creator?: {
    username: string;
  };
  dateFinished: string;
  transactionItems: TransactionItem[];
  fileAttachments: FileAttachment[];
  reversed: boolean;
  type: TransactionType;
}

export interface TransactionItem {
  [prop: string]: any;
}

export interface CcToGoldTransactionItem extends TransactionItem {
  ccAmount: number;
  goldPerCC: number;
  goldPaid: number;
}

export interface ItemToGoldTransactionItem extends TransactionItem {
  itemName: string;
  itemQuantity: number;
  itemPriceInGold: number;
}

export interface GoldToPhpTransactionItem extends TransactionItem {
  name: string;
  phpPaid: number;
  goldPerPhp: number;
  methodOfPayment: string;
}

export interface TransactionPageDto {
  transactions: Transaction[];
  totalPages: number;
  totalTransactions: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateEditTxFormInput {
  username: string;
  dateFinished: string;
  type: TransactionType;
  fileAttachments: FileAttachment[];
  transactionItems: TransactionItem[];
}

export const CreateEditTxFormInputSchema = yup.object().shape({
  username: yup.string().required('Username is required.'),
  dateFinished: yup.date().notRequired(),
  type: yup
    .mixed()
    .oneOf(
      [
        TransactionType.CC2GOLD,
        TransactionType.GOLD2PHP,
        TransactionType.ITEM2GOLD,
      ],
      'Type can only be CC to GOLD, GOLD to PHP, ITEM to GOLD'
    ),
  fileAttachments: yup.array().of(
    yup.object().shape({
      fileName: yup.string().required('Required.'),
      fileUrl: yup.string().url('Must be a url').required('Required'),
    })
  ),
  transactionItems: yup.array().of(
    yup.object().shape({
      ccAmount: yup
        .number()
        .test(
          'CC2GOLD ccAmount test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.CC2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      goldPerCC: yup
        .number()
        .test(
          'CC2GOLD goldPerCC test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.CC2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      goldPaid: yup
        .number()
        .test(
          'CC2GOLD goldPaid test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.CC2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      name: yup
        .string()
        .test('GOLD2PHP name test', 'Required', (value, context) => {
          let isValid = true;
          const type = context.from && context.from[1].value.type;
          if (type === TransactionType.GOLD2PHP) {
            if (!value || value.length < 0) isValid = false;
          }
          return isValid;
        }),
      phpPaid: yup
        .number()
        .test(
          'GOLD2PHP phpPaid test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.GOLD2PHP) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      goldPerPhp: yup
        .number()
        .test(
          'GOLD2PHP goldPerPhp test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.GOLD2PHP) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      methodOfPayment: yup
        .string()
        .test('GOLD2PHP methodOfPayment test', 'Required', (value, context) => {
          let isValid = true;
          const type = context.from && context.from[1].value.type;
          if (type === TransactionType.GOLD2PHP) {
            if (!value || value.length < 0) isValid = false;
          }
          return isValid;
        }),
      itemName: yup
        .string()
        .test('ITEM2GOLD itemName test', 'Required', (value, context) => {
          let isValid = true;
          const type = context.from && context.from[1].value.type;
          if (type === TransactionType.ITEM2GOLD) {
            if (!value || value.length < 0) isValid = false;
          }
          return isValid;
        }),
      itemQuantity: yup
        .number()
        .test(
          'ITEM2GOLD itemQuantity test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.ITEM2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
      itemPriceInGold: yup
        .number()
        .test(
          'ITEM2GOLD itemPriceInGold test',
          'Must be greater than 0',
          (value, context) => {
            let isValid = true;
            const type = context.from && context.from[1].value.type;
            if (type === TransactionType.ITEM2GOLD) {
              if (!value || value < 0) isValid = false;
            }
            return isValid;
          }
        ),
    })
  ),
});

const getBackendUri = () => {
  if (import.meta.env.DEV && import.meta.env.VITE_BACKEND_SERVICE_URI_DEV) {
    return import.meta.env.VITE_BACKEND_SERVICE_URI_DEV;
  }
  return '';
};

const getBackendVersion = () => {
  if (import.meta.env.DEV && import.meta.env.VITE_BACKEND_VERSION) {
    return import.meta.env.VITE_BACKEND_VERSION;
  }
  return 'v1';
};

const BACKEND_URI = getBackendUri();
const BACKEND_VERSION = getBackendVersion();

const getTransactionByUsernameAndId = (username: string, id: string) => {
  const searchParams = new URLSearchParams({ username, id }).toString();
  return {
    method: 'GET',
    relativeUrl: `${BACKEND_URI}/api/${BACKEND_VERSION}/transactions/search?${searchParams}`,
  };
};

const getTransactionById = (id: string): RequestConfig => {
  return {
    method: 'GET',
    relativeUrl: `${BACKEND_URI}/api/${BACKEND_VERSION}/transactions/${id}`,
  };
};

// pageNumber starts at index 1
const getAccountOwnTransactions = (
  accessToken: string,
  pageNumber: number,
  pageSize: number,
  txType: string | undefined,
  afterDate: string | undefined,
  beforeDate: string | undefined
): RequestConfig => {
  const searchParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    txType: txType || '',
    afterDate: afterDate || '',
    beforeDate: beforeDate || '',
  }).toString();
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'GET',
    relativeUrl: `${BACKEND_URI}/api/${BACKEND_VERSION}/accounts/@self/transactions?${searchParams}`,
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
    relativeUrl: `${BACKEND_URI}/api/${BACKEND_VERSION}/accounts/@self/transactions`,
    defaultErrorMessage: `Can't create transaction right now. Please try again later`,
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
    relativeUrl: `${BACKEND_URI}/api/${BACKEND_VERSION}/accounts/@self/transactions/${id}`,
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
    relativeUrl: `${BACKEND_URI}/api/${BACKEND_VERSION}/accounts/@self/transactions/${id}`,
  };
};

const uploadTransaction = async (accessToken: string, formData: FormData) => {
  return fetch(
    `${BACKEND_URI}/api/${BACKEND_VERSION}/accounts/@self/transactions/upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );
};

const downloadTransaction = async (accessToken: string, params: string) => {
  return fetch(
    `${BACKEND_URI}/api/${BACKEND_VERSION}/accounts/@self/transactions/download${params}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export default {
  createAccountOwnTransactions,
  getAccountOwnTransactions,
  updateAccountOwnTransaction,
  deleteAccountOwnTransaction,
  getTransactionByUsernameAndId,
  getTransactionById,
  downloadTransaction,
  uploadTransaction,
};
