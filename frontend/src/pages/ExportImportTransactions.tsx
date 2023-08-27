import React, { useRef, useState } from 'react';
import * as yup from 'yup';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import fileDownload from 'js-file-download';
import { Formik, FormikHelpers } from 'formik';
import { Link } from 'react-router-dom';
import TransactionService from '../api/transaction-api';
import { IRootState } from '../store';
import RequestStatusMessage from '../components/UI/RequestStatusMessage';
import { ApiError, isExceptionResponse } from '../hooks/useHttp';

interface ExportTxFormInput {
  dateFrom: string | undefined;
  dateTo: string | undefined;
}

const exportTxFormInputSchema = yup.object().shape({
  dateFrom: yup.date().notRequired().default(null),
  dateTo: yup.date().notRequired().default(null),
});

const MIN_DATE = new Date();
MIN_DATE.setFullYear(1970);
const MAX_DATE = new Date();
MAX_DATE.setFullYear(9999);

function ExportImportTransactions() {
  const auth = useSelector((state: IRootState) => state.auth);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<
    'pending' | 'completed' | null
  >(null);
  const [uploadError, setUploadError] = useState<string | string[] | null>('');
  const [overwrite, setOverwrite] = useState(false);
  const [uploadData, setUploadData] = useState<any>(null);

  const exportTxFormInitialValues: ExportTxFormInput = {
    dateFrom: undefined,
    dateTo: undefined,
  };

  // Export/Download Transaction submit handler
  const exportTxFormSubmitHandler = (
    values: ExportTxFormInput,
    actions: FormikHelpers<ExportTxFormInput>
  ) => {
    let params = '';
    const queryParams = {
      afterDate: values.dateFrom
        ? new Date(values.dateFrom).toISOString()
        : MIN_DATE.toISOString(),
      beforeDate: values.dateTo
        ? new Date(values.dateTo).toISOString()
        : MAX_DATE.toISOString(),
    };
    params = `?${new URLSearchParams(queryParams).toString()}`;

    let filename = 'Transaction.xlsx';
    TransactionService.downloadTransaction(auth.accessToken, params)
      .then((resp) => {
        const contentDispositionHeader = resp.headers.get(
          'Content-Disposition'
        );
        if (contentDispositionHeader !== null) {
          const parts = contentDispositionHeader.split('filename=');
          filename = parts[1].substring(1, parts[1].length - 1);
        }
        return resp.blob();
      })
      .then((blob) => fileDownload(blob, filename))
      .catch((error) =>
        console.log('Error in downlading the transaction excel file', error)
      );

    actions.setSubmitting(false);
  };

  const uploadSubmitHandler: React.FormEventHandler = (event) => {
    event.preventDefault();
    console.log('Uploading');

    const formData = new FormData();
    if (fileInput && fileInput.current) {
      if (fileInput.current.files && fileInput.current.files[0]) {
        // reset the error, status, message
        setUploadStatus('pending');
        setUploadError(null);
        setUploadMessage('');

        formData.append('file', fileInput.current.files[0]);
        formData.append('overwrite', overwrite.toString());
        TransactionService.uploadTransaction(auth.accessToken, formData)
          .then((res) => {
            if (res.ok || (res.status >= 400 && res.status < 500)) {
              setUploadStatus('completed');
              return res.json();
            }
            throw new ApiError(['Something went wrong.']);
          })
          .then((data) => {
            if (isExceptionResponse(data)) {
              throw new ApiError(data.errors);
            }
            const itemsAffected = data[`Transactions Affected`];
            setUploadMessage(`Transactions affected: ${itemsAffected}`);
            setUploadData(data);
          })
          .catch((error: ApiError) => {
            setUploadStatus('completed');
            setUploadError(error.messages);
          });
      }
    }
  };

  return (
    <Container>
      <Row>
        <Col />
        <Col xs={10} md={8} lg={6} xl={4} className="vh-100 py-5">
          <div className="h-100">
            <div className="d-flex flex-column h-50">
              <div className="mb-3">
                <h3 className="text-center">Export Transactions</h3>
                <div>
                  <Formik
                    validationSchema={exportTxFormInputSchema}
                    onSubmit={exportTxFormSubmitHandler}
                    initialValues={exportTxFormInitialValues}
                    enableReinitialize
                  >
                    {({
                      handleSubmit,
                      handleChange,
                      handleBlur,
                      values,
                      touched,
                      errors,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <Form.Group
                            className="mb-3"
                            controlId="exportTxDateFrom"
                          >
                            <Form.Label>Date from:</Form.Label>
                            <Form.Control
                              type="datetime-local"
                              name="dateFrom"
                              value={values.dateFrom}
                              isValid={touched.dateFrom && !errors.dateFrom}
                              isInvalid={touched.dateFrom && !!errors.dateFrom}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.dateFrom}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="mb-5">
                          <Form.Group
                            className="mb-3"
                            controlId="exportTxDateTo"
                          >
                            <Form.Label>Date from:</Form.Label>
                            <Form.Control
                              type="datetime-local"
                              name="dateTo"
                              value={values.dateTo}
                              isValid={touched.dateTo && !errors.dateTo}
                              isInvalid={touched.dateTo && !!errors.dateTo}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.dateTo}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="d-flex justify-content-end">
                          <Button variant="primary" type="submit">
                            Download
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
            <div className="d-flex flex-column h-50">
              <div className="mb-3">
                <h3 className="text-center">Import Transactions</h3>
                <div>
                  <Form onSubmit={uploadSubmitHandler}>
                    <div>
                      <RequestStatusMessage
                        className="mb-2"
                        data={uploadData}
                        error={uploadError}
                        loadingMessage="Importing Transaction..."
                        status={uploadStatus}
                        successMessage={`Transaction imported! ${uploadMessage}`}
                      />
                    </div>
                    <div>
                      <Form.Group className="mb-3" controlId="exportTxDateTo">
                        <Form.Label>File to upload:</Form.Label>
                        <Form.Control type="file" name="file" ref={fileInput} />
                      </Form.Group>
                    </div>
                    <div className="mb-5">
                      <Form.Check
                        type="checkbox"
                        checked={overwrite}
                        onChange={(e) => setOverwrite(e.currentTarget.checked)}
                        label="Overwrite?"
                      />
                    </div>
                    <div className="d-flex justify-content-end">
                      <Button variant="primary" type="submit">
                        Upload
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
            <div className="text-center mt-auto">
              <Link to="/">Back to Home</Link>
            </div>
          </div>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}

export default ExportImportTransactions;
