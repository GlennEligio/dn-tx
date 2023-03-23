import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { WrappedApp } from './App';
import store from './store/index';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <WrappedApp />
    </React.StrictMode>
  </Provider>
);
