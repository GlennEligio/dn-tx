import moment from 'moment-timezone';
import 'intl';
import {
  CcToGoldTransactionItem,
  GoldToPhpTransactionItem,
  ItemToGoldTransactionItem,
  TransactionItem,
  TransactionType,
} from '../api/transaction-api';

const getPageArray = (
  currentPage: number,
  totalPages: number,
  maxPageDisplay: number
) => {
  const trueCurrentPage = () => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  };
  let pageArray = [trueCurrentPage()];
  let tempPageArray = [trueCurrentPage()];
  let currentNum = 1;

  do {
    pageArray = [...tempPageArray];
    tempPageArray.push(trueCurrentPage() + currentNum);
    tempPageArray.unshift(trueCurrentPage() - currentNum);
    tempPageArray = [...tempPageArray].filter((p) => p > 0 && p <= totalPages);

    currentNum += 1;
  } while (
    tempPageArray.length !== pageArray.length &&
    pageArray.length < maxPageDisplay
  );

  return pageArray;
};

export default {
  getPageArray,
};

export const getCharacterValidationError = (str: string) => {
  return `Your password must have at least 1 ${str} character`;
};

export const getZonedDateTimeFromDateString = (date: string) => {
  const dateString = moment(date)
    .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .toISOString();
  return dateString || '';
};

export const getDateFromZonedDateTimeString = (zdt: string) => {
  const date = moment(zdt)
    .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .format('yyyy-MM-DDTHH:mm');
  return date;
};

export const txTypeText = (txType: TransactionType, isReversed: boolean) => {
  const txTextMap: { [any: string]: string } = {
    CC2GOLD: 'CC to Gold',
    GOLD2CC: 'Gold to CC',
    GOLD2PHP: 'Gold to PHP',
    PHP2GOLD: 'PHP to Gold',
    ITEM2GOLD: 'Item to Gold',
    GOLD2ITEM: 'Gold to Item',
  };

  const splitTx = txType.split('2');
  const finalTxTypeString = isReversed
    ? [splitTx[1], '2', splitTx[0]].join('')
    : txType;
  return txTextMap[finalTxTypeString];
};

export const transformTxItems = (
  type: TransactionType,
  items: TransactionItem[]
) => {
  let finalItems: TransactionItem[] = [];
  finalItems = items.map((i) => {
    let finalItem = null;
    switch (type) {
      case TransactionType.CC2GOLD:
        finalItem = {
          ccAmount: (i as CcToGoldTransactionItem).ccAmount,
          goldPaid: (i as CcToGoldTransactionItem).goldPaid,
          goldPerCC: (i as CcToGoldTransactionItem).goldPerCC,
        } as CcToGoldTransactionItem;
        break;
      case TransactionType.GOLD2PHP:
        finalItem = {
          goldPerPhp: (i as GoldToPhpTransactionItem).goldPerPhp,
          methodOfPayment: (i as GoldToPhpTransactionItem).methodOfPayment,
          name: (i as GoldToPhpTransactionItem).name,
          phpPaid: (i as GoldToPhpTransactionItem).phpPaid,
        } as GoldToPhpTransactionItem;
        break;
      case TransactionType.ITEM2GOLD:
        finalItem = {
          itemName: (i as ItemToGoldTransactionItem).itemName,
          itemPriceInGold: (i as ItemToGoldTransactionItem).isTotal
            ? (i as ItemToGoldTransactionItem).itemPriceInGold /
              (i as ItemToGoldTransactionItem).itemQuantity
            : (i as ItemToGoldTransactionItem).itemPriceInGold,
          itemQuantity: (i as ItemToGoldTransactionItem).itemQuantity,
        } as ItemToGoldTransactionItem;
        break;
      default:
        finalItem = {
          ccAmount: (i as CcToGoldTransactionItem).ccAmount,
          goldPaid: (i as CcToGoldTransactionItem).goldPaid,
          goldPerCC: (i as CcToGoldTransactionItem).goldPerCC,
        } as CcToGoldTransactionItem;
        break;
    }
    return finalItem;
  });
  return finalItems;
};
