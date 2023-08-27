import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as moment from 'moment-timezone';
import { Transaction } from '../../api/transaction-api';
import { getZonedDateTimeFromDateString } from '../../util/utils';

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
          <span className="text-muted">
            {moment(
              getZonedDateTimeFromDateString(transaction.dateFinished)
            ).format('LLL')}
          </span>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default TransactionCard;
