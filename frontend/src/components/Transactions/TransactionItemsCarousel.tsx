import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { FormikErrors, FormikTouched, getIn } from 'formik';
import { Button, Form } from 'react-bootstrap';
import {
  CcToGoldTransactionItem,
  GoldToPhpTransactionItem,
  ItemToGoldTransactionItem,
  Transaction,
  TransactionItem,
  TransactionType,
} from '../../api/transaction-api';
import CarouselWithAddRemove from '../UI/CarouselWithAddRemove';

// values, errors, touched is from Formik
interface TransactionItemsCarouselProps<T> {
  txType: TransactionType;
  transactionItems: TransactionItem[];
  setNewTxItems?: (newTxItems: TransactionItem[]) => void;
  readOnly: boolean;
  values: T;
  touched: FormikTouched<T>;
  errors: FormikErrors<T>;
}

function TransactionItemsCarousel<T>({
  transactionItems,
  txType,
  setNewTxItems = () => {},
  readOnly,
  values,
  errors,
  touched,
}: TransactionItemsCarouselProps<T>) {
  const [currIdx, setCurrIdx] = useState(0);

  const addTransactionItem = () => {
    let newTx:
      | CcToGoldTransactionItem
      | ItemToGoldTransactionItem
      | GoldToPhpTransactionItem;
    switch (txType) {
      case TransactionType.CC2GOLD:
        newTx = {
          ccAmount: 1,
          goldPaid: 1,
          goldPerCC: 1,
        } as CcToGoldTransactionItem;
        break;
      case TransactionType.GOLD2PHP:
        newTx = {
          goldPerPhp: 1,
          methodOfPayment: '',
          name: '',
          phpPaid: 1,
        } as GoldToPhpTransactionItem;
        break;
      case TransactionType.ITEM2GOLD:
        newTx = {
          itemName: '',
          itemPriceInGold: 1,
          itemQuantity: 1,
        } as ItemToGoldTransactionItem;
        break;
      default:
        newTx = {
          itemName: '',
          itemPriceInGold: 0,
          itemQuantity: 0,
        } as ItemToGoldTransactionItem;
        break;
    }
    setNewTxItems([...transactionItems, newTx]);
  };

  const removeTransactionItem = (idx: number) => {
    const newTxItems = [...transactionItems];
    newTxItems.splice(idx, 1);
    setCurrIdx(0);
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

  const currentTxItem = transactionItems.at(currIdx);

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
    const fieldPath = `${arrayField}[${idx}].${itemField}`;
    const inputError = getIn(errors, fieldPath);
    const inputTouched = getIn(touched, fieldPath);
    return inputTouched && !!inputError;
  };

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
                  value={(currentTxItem as GoldToPhpTransactionItem).name}
                />
                <Form.Control.Feedback type="invalid">
                  {getArrayItemFieldError('transactionItems', 'name', currIdx)}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="createTxFormPhpPaid">
                <Form.Label>PHP paid</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter php amount"
                  readOnly={readOnly}
                  name="phpPaid"
                  onChange={changeTxItemValue}
                  value={(currentTxItem as GoldToPhpTransactionItem).phpPaid}
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
                  value={(currentTxItem as GoldToPhpTransactionItem).goldPerPhp}
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
                    (currentTxItem as GoldToPhpTransactionItem).methodOfPayment
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
                  min={1}
                  placeholder="Enter CC amount"
                  readOnly={readOnly}
                  name="ccAmount"
                  onChange={changeTxItemValue}
                  value={(currentTxItem as CcToGoldTransactionItem).ccAmount}
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
                  min={1}
                  placeholder="Enter gold to cc ratio"
                  readOnly={readOnly}
                  name="goldPerCC"
                  onChange={changeTxItemValue}
                  value={(currentTxItem as CcToGoldTransactionItem).goldPerCC}
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
                  min={1}
                  placeholder="Enter gold paid"
                  readOnly={readOnly}
                  name="goldPaid"
                  onChange={changeTxItemValue}
                  value={(currentTxItem as CcToGoldTransactionItem).goldPaid}
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
                  value={(currentTxItem as ItemToGoldTransactionItem).itemName}
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
                  min={1}
                  placeholder="Enter item quantity"
                  readOnly={readOnly}
                  name="itemQuantity"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as ItemToGoldTransactionItem).itemQuantity
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
                <Form.Label>Item price in gold</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  placeholder="Enter item price in gold"
                  readOnly={readOnly}
                  name="itemPriceInGold"
                  onChange={changeTxItemValue}
                  value={
                    (currentTxItem as ItemToGoldTransactionItem).itemPriceInGold
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
