import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTransaction from './pages/CreateTransaction';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import SearchTransaction from './pages/SearchTransaction';
import TransactionDetails from './pages/TransactionDetails';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchTransaction />} />
        <Route
          path="/transactions/:transactionId"
          element={<TransactionDetails />}
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
