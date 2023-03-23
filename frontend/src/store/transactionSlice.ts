import { createSlice } from '@reduxjs/toolkit';
import { Transaction } from '../api/transaction-api';

export interface TransactionState {
  selectedTransaction: Transaction | null;
  transactions: Transaction[];
}

const INITIAL_STATE: TransactionState = {
  selectedTransaction: null,
  transactions: [],
};

const transactionSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,
  reducers: {
    updateSelectedTransaction(state, action) {
      state.selectedTransaction = action.payload.transaction;
    },
  },
});

export default transactionSlice.reducer;
export const transactionActions = transactionSlice.actions;
