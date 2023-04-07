import { Stack } from 'react-bootstrap';
import {
  DiamondFill,
  ArrowClockwise,
  ExclamationCircleFill,
  CheckCircleFill,
} from 'react-bootstrap-icons';

interface RequestStatusMessageProps {
  data: any;
  error: string | null;
  status: 'pending' | 'completed' | null;
  loadingMessage: string;
  successMessage: string;
  className?: string;
  startMessage?: string;
}

function RequestStatusMessage({
  data,
  error,
  status,
  loadingMessage,
  successMessage,
  startMessage,
  className,
}: RequestStatusMessageProps) {
  let MessageDisplay = null;
  if (status === null && startMessage) {
    MessageDisplay = (
      <div className="d-flex justify-content-center">
        <Stack direction="horizontal" gap={1}>
          <DiamondFill />
          <span>{startMessage}</span>
        </Stack>
      </div>
    );
  }
  if (status === 'pending') {
    MessageDisplay = (
      <div className="d-flex justify-content-center">
        <Stack direction="horizontal" gap={1}>
          <ArrowClockwise />
          <span>{loadingMessage}</span>
        </Stack>
      </div>
    );
  } else if (status === 'completed') {
    if (error !== null || data === null) {
      MessageDisplay = (
        <div className="d-flex justify-content-center text-danger">
          <Stack direction="horizontal" gap={1}>
            <ExclamationCircleFill />
            <span>{error}</span>
          </Stack>
        </div>
      );
    } else if (error === null || data !== null) {
      MessageDisplay = (
        <div className="d-flex justify-content-center text-success">
          <Stack direction="horizontal" gap={1}>
            <CheckCircleFill />
            <span>{successMessage}</span>
          </Stack>
        </div>
      );
    }
  }
  return (
    <div className={`request-status-message ${className}`}>
      {MessageDisplay}
    </div>
  );
}

export default RequestStatusMessage;
