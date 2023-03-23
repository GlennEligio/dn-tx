import { ChangeEvent, useState } from 'react';

type ValidationFunction = (input: any) => {
  valueIsValid: boolean;
  errorMessage: string;
};

export enum InputType {
  TEXT = 'TEXT',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
}

interface UseInputHookReturn<T, E> {
  value: T;
  hasError: boolean;
  isValid: boolean;
  errorMessage: string;
  reset: () => void;
  set: (newValue: T) => void;
  inputBlurHandler: () => void;
  valueChangeHandler: (event: ChangeEvent<E>) => void;
}

const useInput = <T, E>(
  validateFn: ValidationFunction,
  defaultValue: T,
  inputType: InputType
): UseInputHookReturn<T, E> => {
  const [enteredValue, setEnteredValue] = useState<T>(defaultValue);
  const [isTouched, setIsTouched] = useState(false);

  const { valueIsValid, errorMessage } = validateFn(enteredValue);
  const hasError = !valueIsValid && isTouched;

  const valueChangeCreator = () => {
    switch (inputType) {
      case InputType.TEXT:
        return (event: ChangeEvent<HTMLInputElement>) => {
          setEnteredValue(event.target.value as T);
        };
      case InputType.SELECT:
        return (event: ChangeEvent<HTMLSelectElement>) => {
          setEnteredValue(event.currentTarget.value as T);
        };
      default:
        return (event: ChangeEvent<HTMLInputElement>) => {
          setEnteredValue(event.target.value as T);
        };
    }
  };

  const valueChangeHandler = valueChangeCreator() as (
    event: ChangeEvent<E>
  ) => void;

  const inputBlurHandler = () => {
    setIsTouched(true);
  };

  const set = (newValue: T) => {
    setEnteredValue(newValue);
  };

  const reset = () => {
    setEnteredValue(defaultValue);
    setIsTouched(false);
  };

  return {
    value: enteredValue,
    hasError,
    isValid: valueIsValid,
    errorMessage,
    reset,
    set,
    inputBlurHandler,
    valueChangeHandler,
  };
};

export default useInput;
