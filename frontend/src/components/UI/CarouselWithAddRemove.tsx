import { PropsWithChildren } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

interface CarouselWithAddRemoveProps {
  totalItems: number;
  currentIdx: number;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  readOnly: boolean;
}

function CarouselWithAddRemove({
  totalItems,
  onAdd,
  onRemove,
  onSwipeRight,
  onSwipeLeft,
  currentIdx,
  readOnly,
  children,
}: PropsWithChildren<CarouselWithAddRemoveProps>) {
  return (
    <>
      <Row className="gx-0">
        <Col className="d-flex justify-content-center align-items-center">
          {totalItems > 1 && currentIdx !== 0 && (
            <ChevronLeft onClick={onSwipeLeft} />
          )}
        </Col>
        <Col xs={10}>{children}</Col>
        <Col className="d-flex justify-content-center align-items-center">
          {totalItems > 1 && currentIdx !== totalItems - 1 && (
            <ChevronRight onClick={onSwipeRight} />
          )}
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-evenly">
          {!readOnly && (
            <>
              <Button onClick={() => onAdd()}>Add</Button>
              <Button onClick={() => onRemove(currentIdx)}>Remove</Button>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default CarouselWithAddRemove;
