import { useReducer, useCallback, useEffect } from 'react';

enum RequestActionKind {
  SEND = 'SEND',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  RESET = 'RESET',
}

export class ApiError extends Error {
  messages: string[];

  constructor(m: string[]) {
    super();
    this.messages = m;
  }
}

interface RequestState<T> {
  data: T | null;
  error: string | string[] | null;
  status: 'pending' | 'completed' | null;
}

interface RequestAction<T> {
  type: string;
  responseData?: T;
  errorMessage?: string | string[];
}

interface ExceptionResponse {
  errors: string[];
  timestamp: string;
  details: string;
}

export const isExceptionResponse = (
  object: any
): object is ExceptionResponse => {
  return 'errors' in object && 'timestamp' in object && 'details' in object;
};

export interface RequestConfig {
  body?: { [props: string]: any };
  headers?: {
    [header: string]: string;
  };
  method?: string;
  relativeUrl?: string;
  defaultErrorMessage?: string;
}

const createDataFetchReducer =
  <T>() =>
  (state: RequestState<T>, action: RequestAction<T>): RequestState<T> => {
    switch (action.type) {
      case RequestActionKind.RESET:
        return {
          status: null,
          data: null,
          error: null,
        };
      case RequestActionKind.SEND:
        return {
          ...state,
          status: 'pending',
          error: null,
          data: null,
        } as RequestState<T>;
      case RequestActionKind.SUCCESS: {
        return {
          ...state,
          error: null,
          status: 'completed',
          data: action.responseData,
        } as RequestState<T>;
      }
      case RequestActionKind.ERROR:
        return {
          ...state,
          error: action.errorMessage,
          status: 'completed',
          data: null,
        } as RequestState<T>;
      default:
        throw new Error('Action not supported');
    }
  };

// eslint-disable-next-line @typescript-eslint/ban-types
function useHttp<T>(startWithPending: boolean, initReqConf?: RequestConfig) {
  const [httpState, dispatch] = useReducer(createDataFetchReducer<T>(), {
    status: startWithPending ? 'pending' : null,
    data: null,
    error: null,
  });

  const determineErrorMessage = (error: any) => {
    if (error instanceof ApiError) {
      return error.message;
    }
    return 'Something went wrong';
  };

  const resetHttpState = () => {
    dispatch({ type: RequestActionKind.RESET });
  };

  const sendRequest = useCallback(async (requestConfig: RequestConfig) => {
    dispatch({ type: RequestActionKind.SEND });
    try {
      const responseObj: T | boolean | ExceptionResponse = await fetch(
        requestConfig.relativeUrl || '',
        {
          method: requestConfig.method || 'GET',
          body:
            requestConfig.body != null
              ? JSON.stringify(requestConfig.body)
              : null,
          headers: requestConfig.headers != null ? requestConfig.headers : {},
        }
      ).then((response) => {
        if (response.ok) {
          return response.json();
        }
        if (response.status >= 400 && response.status < 500) {
          return response.json() as Promise<ExceptionResponse>;
        }
        throw new ApiError(
          requestConfig.defaultErrorMessage
            ? [requestConfig.defaultErrorMessage]
            : ['Something went wrong']
        );
      });

      if (isExceptionResponse(responseObj)) {
        dispatch({
          type: RequestActionKind.ERROR,
          errorMessage: responseObj.errors,
        });
        return;
      }

      dispatch({
        type: RequestActionKind.SUCCESS,
        responseData: responseObj,
      });
    } catch (error) {
      dispatch({
        type: RequestActionKind.ERROR,
        errorMessage: determineErrorMessage(error),
      });
    }
  }, []);

  useEffect(() => {
    if (startWithPending && initReqConf) {
      sendRequest(initReqConf);
    }
  }, [startWithPending]);

  return {
    sendRequest,
    resetHttpState,
    ...httpState,
  };
}

export default useHttp;
