import { ChangeEventHandler, useState, useCallback } from 'react';
import { FormikErrors, FormikTouched, getIn } from 'formik';
import { Button, Form } from 'react-bootstrap';
import { FileAttachment } from '../../api/transaction-api';
import CarouselWithAddRemove from '../UI/CarouselWithAddRemove';

// errors, touched is from Formik
interface FileAttachmentsCarouselProps<T> {
  fileAttachments: FileAttachment[];
  readOnly: boolean;
  setNewFileAttachments?: (newFileAttachments: FileAttachment[]) => void;
  touched?: FormikTouched<T>;
  errors?: FormikErrors<T>;
}

function FileAttachmentsCarousel<T>({
  fileAttachments,
  setNewFileAttachments = () => {},
  readOnly,
  errors = {},
  touched = {},
}: FileAttachmentsCarouselProps<T>) {
  const [currIdx, setCurrIdx] = useState(0);

  const createNewFileAtch = useCallback(() => {
    const newFileAtch: FileAttachment = { fileName: '', fileUrl: '' };
    return newFileAtch;
  }, []);

  const addAttachmentHandler = () => {
    const newAtch = createNewFileAtch();
    setNewFileAttachments([...fileAttachments, newAtch]);
  };

  const removeAttachmentHandler = (idx: number) => {
    const newTxItems = [...fileAttachments];
    newTxItems.splice(idx, 1);
    setCurrIdx(0);
    setNewFileAttachments(newTxItems);
  };

  const swipeRight = () => {
    if (currIdx >= 0 && currIdx < fileAttachments.length - 1) {
      setCurrIdx((prevIdx) => {
        let newIdx = prevIdx;
        newIdx += 1;
        return newIdx;
      });
    }
  };

  const swipeLeft = () => {
    if (currIdx <= fileAttachments.length - 1 && currIdx > 0) {
      setCurrIdx((prevIdx) => {
        let newIdx = prevIdx;
        newIdx -= 1;
        return newIdx;
      });
    }
  };

  const changeFileUrlHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const fieldValue = e.target.value;
    const updatedFileAtchs = [...fileAttachments];
    updatedFileAtchs[currIdx].fileUrl = fieldValue;
    setNewFileAttachments(updatedFileAtchs);
  };

  const changeFileNameHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const fieldValue = e.target.value;
    const updatedFileAtchs = [...fileAttachments];
    updatedFileAtchs[currIdx].fileName = fieldValue;
    setNewFileAttachments(updatedFileAtchs);
  };

  const getArrayItemFieldPath = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    return `${arrayField}[${idx}].${itemField}`;
  };

  const getArrayItemFieldError = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    return getIn(errors, getArrayItemFieldPath(arrayField, itemField, idx));
  };

  const getArrayItemFieldIsValid = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    const fieldPath = getArrayItemFieldPath(arrayField, itemField, idx);
    const inputError = getIn(errors, fieldPath);
    const inputTouched = getIn(touched, fieldPath);
    return inputTouched && !inputError;
  };

  const getArrayItemFieldIsInvalid = (
    arrayField: string,
    itemField: string,
    idx: number
  ) => {
    const fieldPath = getArrayItemFieldPath(arrayField, itemField, idx);
    const inputError = getIn(errors, fieldPath);
    const inputTouched = getIn(touched, fieldPath);
    return inputTouched && !!inputError;
  };

  const currentFileAtch = fileAttachments.at(currIdx);

  return (
    <>
      {fileAttachments.length === 0 && !readOnly && (
        <div className="mt-2 d-flex justify-content-center">
          <Button onClick={addAttachmentHandler}>
            Add file attachment item
          </Button>
        </div>
      )}
      {fileAttachments.length > 0 && (
        <CarouselWithAddRemove
          totalItems={fileAttachments.length}
          currentIdx={currIdx}
          onAdd={addAttachmentHandler}
          onRemove={removeAttachmentHandler}
          onSwipeRight={swipeRight}
          onSwipeLeft={swipeLeft}
          readOnly={readOnly}
        >
          <>
            <Form.Group className="mb-3" controlId="fileAtchName">
              <Form.Label>File name</Form.Label>
              <Form.Control
                type="text"
                placeholder="File name"
                readOnly={readOnly}
                name="fileName"
                onChange={changeFileNameHandler}
                value={currentFileAtch ? currentFileAtch.fileName : ''}
                isValid={getArrayItemFieldIsValid(
                  'fileAttachments',
                  'fileName',
                  currIdx
                )}
                isInvalid={getArrayItemFieldIsInvalid(
                  'fileAttachments',
                  'fileName',
                  currIdx
                )}
              />
              <Form.Control.Feedback type="invalid">
                {getArrayItemFieldError('fileAttachments', 'fileUrl', currIdx)}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="fileAtchUrl">
              <Form.Label>File url</Form.Label>
              <Form.Control
                type="text"
                placeholder="File url"
                readOnly={readOnly}
                name="fileUrl"
                onChange={changeFileUrlHandler}
                value={currentFileAtch ? currentFileAtch.fileUrl : ''}
                isValid={getArrayItemFieldIsValid(
                  'fileAttachments',
                  'fileUrl',
                  currIdx
                )}
                isInvalid={getArrayItemFieldIsInvalid(
                  'fileAttachments',
                  'fileUrl',
                  currIdx
                )}
              />
              <Form.Control.Feedback type="invalid">
                {getArrayItemFieldError('fileAttachments', 'fileUrl', currIdx)}
              </Form.Control.Feedback>
            </Form.Group>
          </>
        </CarouselWithAddRemove>
      )}
    </>
  );
}

export default FileAttachmentsCarousel;
