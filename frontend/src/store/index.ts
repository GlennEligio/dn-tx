import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './authSlice';

export interface IRootState {
  auth: AuthState;
}

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
