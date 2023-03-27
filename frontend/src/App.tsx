import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import Account from './pages/Account';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchTransaction />} />
        <Route path="/account" element={<Account />} />
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
