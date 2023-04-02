import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Transaction } from '../../api/transaction-api';

interface TransactionCardProps {
  transaction: Transaction;
  className: string;
}

function TransactionCard({ transaction, className }: TransactionCardProps) {
  return (
    <Card className={className || ''}>
      <Card.Body>
        <Card.Title>
          <Link to={`/transactions/${transaction.id}`}>{transaction.id}</Link>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {transaction.type}
        </Card.Subtitle>
        <Card.Text>
          <b>Username: </b>
          <br />
          <span className="text-muted">{transaction.username}</span>
          <br />
          <b>Date created: </b>
          <br />
          <span className="text-muted">{transaction.dateFinished}</span>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default TransactionCard;
