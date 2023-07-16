import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CreateTransaction from './pages/CreateTransaction';
import EditTransaction from './pages/EditTransaction';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import SearchTransaction from './pages/SearchTransaction';
import TransactionDetails from './pages/TransactionDetails';
import 'bootstrap/dist/css/bootstrap.min.css';
import DeleteTransactionSuccess from './pages/DeleteTransactionSuccess';
import Transactions from './pages/Transactions';
import AccountDetails from './pages/AccountDetails';
import { IRootState } from './store';
import ExportImportTransactions from './pages/ExportImportTransactions';

export function App() {
  const auth = useSelector((state: IRootState) => state.auth);
  const loggedIn: boolean =
    !!auth.accessToken && !!auth.username && !!auth.fullName;

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchTransaction />} />
        {loggedIn && (
          <>
            <Route path="/transactions" element={<Transactions />} />
            <Route
              path="/transactions/:transactionId"
              element={<TransactionDetails />}
            />
            <Route
              path="/transactions/delete/success"
              element={<DeleteTransactionSuccess />}
            />
            <Route
              path="/transactions/:transactionId/edit"
              element={<EditTransaction />}
            />
            <Route path="/create-transaction" element={<CreateTransaction />} />
            <Route path="/account" element={<AccountDetails />} />
            <Route
              path="/export-and-import"
              element={<ExportImportTransactions />}
            />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
