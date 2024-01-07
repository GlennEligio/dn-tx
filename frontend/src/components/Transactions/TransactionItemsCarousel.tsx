import React, {
  ChangeEventHandler,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { FormikErrors, FormikTouched, getIn } from 'formik';
import { Button, Form, FormCheck } from 'react-bootstrap';
import {
  CcToGoldTransactionItem,
  GoldToPhpTransactionItem,
  ItemToGoldTransactionItem,
  TransactionItem,
  TransactionType,
} from '../../api/transaction-api';
import CarouselWithAddRemove from '../UI/CarouselWithAddRemove';

// errors, touched is from Formik
interface TransactionItemsCarouselProps<T> {
  txType: TransactionType;
  transactionItems: TransactionItem[];
  readOnly: boolean;
  setNewTxItems?: (newTxItems: TransactionItem[]) => void;
  touched?: FormikTouched<T>;
  errors?: FormikErrors<T>;
}

function TransactionItemsCarousel<T>({
  transactionItems,
  txType,
  setNewTxItems = () => {},
  readOnly,
  errors = {},
  touched = {},
}: TransactionItemsCarouselProps<T>) {
  const [currIdx, setCurrIdx] = useState(0);

  const createNewTransaction = useCallback((type: TransactionType) => {
    let newTx:
      | CcToGoldTransactionItem
      | ItemToGoldTransactionItem
      | GoldToPhpTransactionItem;
    switch (type) {
      case TransactionType.CC2GOLD:
        newTx = {
          ccAmount: 0,
          goldPaid: 0,
          goldPerCC: 0,
        } as CcToGoldTransactionItem;
        break;
      case TransactionType.GOLD2PHP:
        newTx = {
          goldPerPhp: 0,
          methodOfPayment: '',
          name: '',
          phpPaid: 0,
        } as GoldToPhpTransactionItem;
        break;
      case TransactionType.ITEM2GOLD:
        newTx = {
          itemName: '',
          itemPriceInGold: 0,
          itemQuantity: 0,
          isTotal: false,
        } as ItemToGoldTransactionItem;
        break;
      default:
        newTx = {
          itemName: '',
          itemPriceInGold: 0,
          itemQuantity: 0,
          isTotal: false,
        } as ItemToGoldTransactionItem;
        break;
    }
    return newTx;
  }, []);

  useEffect(() => {
    const newTx = createNewTransaction(txType);
    setNewTxItems([newTx]);
  }, [txType, createNewTransaction, setNewTxItems]);

  const addTransactionItem = () => {
    const newTx = createNewTransaction(txType);
    setNewTxItems([...transactionItems, newTx]);
    // check if transaction items is non-empty
    // if non-empty, allowed to increase the curr pointer
    setCurrIdx((prevCurr) => {
      let newCurr = 0;
      if (transactionItems.length > 0) newCurr = prevCurr + 1;
      return newCurr;
    });
  };

  const removeTransactionItem = (idx: number) => {
    const newTxItems = [...transactionItems];
    newTxItems.splice(idx, 1);
    // check if transaction items is empty
    // if empty, do not reduce the curr pointer
    setCurrIdx((prevCurr) => {
      let newCurr = 0;
      if (transactionItems.length > 1) newCurr = prevCurr - 1;
      return newCurr;
    });
    setNewTxItems(newTxItems);
  };

  const swipeRight = () => {
    if (currIdx >= 0 && currIdx < transactionItems.length - 1) {
      setCurrIdx((prevIdx) => {
        let newIdx = prevIdx;
        newIdx += 1;
        return newIdx;
      });
    }
  };

  const swipeLeft = () => {
    if (currIdx <= transactionItems.length - 1 && currIdx > 0) {
      setCurrIdx((prevIdx) => {
        let newIdx = prevIdx;
        newIdx -= 1;
        return newIdx;
      });
    }
  };

  const changeTxItemValue: ChangeEventHandler<HTMLInputElement> = (e) => {
    const fieldValue = e.target.value;
    const fieldName = e.target.name;
    const updatedTxItems = [...transactionItems];
    updatedTxItems[currIdx][fieldName] = fieldValue;
    setNewTxItems(updatedTxItems);
  };

  const changeTxItemBool: ChangeEventHandler<HTMLInputElement> = (e) => {
    const fieldName = e.target.name;
    const fieldBoolVal = e.target.checked;
    const updatedTxItems = [...transactionItems];
    updatedTxItems[currIdx][fieldName] = fieldBoolVal;
    setNewTxItems(updatedTxItems);
  };

  const getArrayItemFieldPath = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    return `${arrayField}[${idx}].${itemField}`;
  };

  const getArrayItemFieldError = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    return getIn(errors, getArrayItemFieldPath(arrayField, itemField, idx));
  };

  const getArrayItemFieldIsValid = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    const fieldPath = getArrayItemFieldPath(arrayField, itemField, idx);
    const inputError = getIn(errors, fieldPath);
    const inputTouched = getIn(touched, fieldPath);
    return inputTouched && !inputError;
  };

  const getArrayItemFieldIsInvalid = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    const fieldPath = getArrayItemFieldPath(arrayField, itemField, idx);
    const inputError = getIn(errors, fieldPath);
    const inputTouched = getIn(touched, fieldPath);
    return inputTouched && !!inputError;
  };

  const currentTxItem = transactionItems.at(currIdx);
  console.log('Current tx item: ', currentTxItem);
  console.log('Current idx: ', currIdx);
  return (
    <>
      {transactionItems.length === 0 && (
        <div className="mt-5 d-flex justify-content-center">
          <Button onClick={addTransactionItem}>Add transaction item</Button>
        </div>
      )}
      {transactionItems.length > 0 && (
        <CarouselWithAddRemove
          totalItems={transactionItems.length}
          currentIdx={currIdx}
          onAdd={addTransactionItem}
          onRemove={removeTransactionItem}
          onSwipeRight={swipeRight}
          onSwipeLeft={swipeLeft}
          readOnly={readOnly}
        >
          {txType === TransactionType.GOLD2PHP && (
            <>
              <Form.Group className="mb-3" controlId="createTxFormName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter name"
                  readOnly={readOnly}
                  onChange={changeTxItemValue}
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'name',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'name',
                    currIdx
                  )}
                  value={(currentTxItem as GoldToPhpTransactionItem).name || ''}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError('transactionItems', 'name', currIdx)}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="createTxFormPhpPaid">
                <Form.Label>PHP paid</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter php amount"
                  readOnly={readOnly}
                  name="phpPaid"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as GoldToPhpTransactionItem).phpPaid || 0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'phpPaid',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'phpPaid',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'phpPaid',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="createTxFormGoldPerPhp">
                <Form.Label>Gold per PHP</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter gold to php ratio"
                  readOnly={readOnly}
                  name="goldPerPhp"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as GoldToPhpTransactionItem).goldPerPhp || 0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'goldPerPhp',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'goldPerPhp',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'goldPerPhp',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="createTxFormMethodOfPayment"
              >
                <Form.Label>Method of payment</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter method of payment"
                  readOnly={readOnly}
                  name="methodOfPayment"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as GoldToPhpTransactionItem)
                      .methodOfPayment || ''
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'methodOfPayment',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'methodOfPayment',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'methodOfPayment',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}
          {txType === TransactionType.CC2GOLD && (
            <>
              <Form.Group className="mb-3" controlId="createTxFormCcAmount">
                <Form.Label>CC Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter CC amount"
                  readOnly={readOnly}
                  name="ccAmount"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as CcToGoldTransactionItem).ccAmount || 0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'ccAmount',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'ccAmount',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'ccAmount',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="createTxFormGoldPerCc">
                <Form.Label>Gold per CC</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter gold to cc ratio"
                  readOnly={readOnly}
                  name="goldPerCC"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as CcToGoldTransactionItem).goldPerCC || 0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'goldPerCC',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'goldPerCC',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'goldPerCC',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="createTxFormGoldPaid">
                <Form.Label>Gold paid</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter gold paid"
                  readOnly={readOnly}
                  name="goldPaid"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as CcToGoldTransactionItem).goldPaid || 0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'goldPaid',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'goldPaid',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'goldPaid',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}
          {txType === TransactionType.ITEM2GOLD && (
            <>
              <Form.Group className="mb-3" controlId="createTxFormItemName">
                <Form.Label>Item name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter item name"
                  readOnly={readOnly}
                  name="itemName"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as ItemToGoldTransactionItem).itemName || ''
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'itemName',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'itemName',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'itemName',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="createTxFormItemQuantity">
                <Form.Label>Item quantity</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter item quantity"
                  readOnly={readOnly}
                  step={1}
                  min={1}
                  name="itemQuantity"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as ItemToGoldTransactionItem).itemQuantity ||
                    0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'itemQuantity',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'itemQuantity',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'itemQuantity',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="createTxFormItemPriceInGold"
              >
                {readOnly && <Form.Label>Item price in gold</Form.Label>}
                {!readOnly && (
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label>
                      {(currentTxItem as ItemToGoldTransactionItem).isTotal
                        ? 'Total price in gold'
                        : 'Item price in gold'}
                    </Form.Label>
                    <FormCheck
                      reverse
                      label={
                        !(currentTxItem as ItemToGoldTransactionItem).isTotal
                          ? 'Total?'
                          : 'Per item?'
                      }
                      type="switch"
                      id="itemPriceIsTotal"
                      name="isTotal"
                      checked={
                        (currentTxItem as ItemToGoldTransactionItem).isTotal
                      }
                      onChange={changeTxItemBool}
                    />
                  </div>
                )}
                <Form.Control
                  type="number"
                  placeholder="Enter item price in gold"
                  readOnly={readOnly}
                  name="itemPriceInGold"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as ItemToGoldTransactionItem)
                      .itemPriceInGold || 0
                  }
                  isValid={getArrayItemFieldIsValid(
                    'transactionItems',
                    'itemPriceInGold',
                    currIdx
                  )}
                  isInvalid={getArrayItemFieldIsInvalid(
                    'transactionItems',
                    'itemPriceInGold',
                    currIdx
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError(
                    'transactionItems',
                    'itemPriceInGold',
                    currIdx
                  )}
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}
        </CarouselWithAddRemove>
      )}
    </>
  );
}

export default TransactionItemsCarousel;
