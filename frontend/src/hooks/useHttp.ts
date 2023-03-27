import { useReducer, useCallback, useEffect } from 'react';

enum RequestActionKind {
  SEND = 'SEND',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  RESET = 'RESET',
}

export class ApiError extends Error {
  message: string;

  constructor(m: string) {
    super();
    this.message = m;
  }
}

interface RequestState<T> {
  data: T | null;
  error: string | null;
  status: 'pending' | 'completed' | null;
}

interface RequestAction<T> {
  type: string;
  responseData?: T;
  errorMessage?: string;
}

export interface RequestConfig {
  body?: { [props: string]: any };
  headers?: {
    [header: string]: string;
  };
  method?: string;
  relativeUrl?: string;
  errorMessage?: string;
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
      // const responseData = await requestFunction(requestConfig);
      const responseObj: T = await fetch(requestConfig.relativeUrl || '', {
        method: requestConfig.method || 'GET',
        body:
          requestConfig.body != null
            ? JSON.stringify(requestConfig.body)
            : null,
        headers: requestConfig.headers != null ? requestConfig.headers : {},
      }).then((response) => {
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') !== -1) {
            return response.json();
          }
          return true;
        }
        throw new ApiError(
          requestConfig.errorMessage || 'Something went wrong'
        );
      });
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
