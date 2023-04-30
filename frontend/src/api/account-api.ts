import { RequestConfig } from '../hooks/useHttp';

export enum AccountType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface LoginResponseDto {
  username: string;
  fullName: string;
  accountType: string;
  accessToken: string;
}

export interface Account {
  id?: string;
  fullName: string;
  username: string;
  password?: string;
  email: string;
}

const getBackendUri = () => {
  if (import.meta.env.DEV && import.meta.env.VITE_BACKEND_SERVICE_URI_DEV) {
    return import.meta.env.VITE_BACKEND_SERVICE_URI_DEV;
  }
  return '';
};

const BACKEND_URI = getBackendUri();

const getOwnAccountDetails = (accessToken: string): RequestConfig => {
  return {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    defaultErrorMessage: "Can't find account details",
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/@self`,
  };
};

const updateOwnAccountDetails = (
  account: Account,
  accessToken: string
): RequestConfig => {
  return {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': `application/json`,
    },
    defaultErrorMessage: "Can't update own account details",
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/@self`,
    body: account,
  };
};

const login = (loginInfo: LoginRequestDto): RequestConfig => {
  return {
    body: {
      username: loginInfo.username,
      password: loginInfo.password,
    },
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/login`,
    defaultErrorMessage: 'Invalid credentials',
  };
};

const register = (registerInfo: RegisterRequestDto): RequestConfig => {
  return {
    body: {
      username: registerInfo.username,
      password: registerInfo.password,
      email: registerInfo.email,
      fullName: registerInfo.fullName,
    },
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    relativeUrl: `${BACKEND_URI}/api/v1/accounts/register`,
    defaultErrorMessage: 'Register failed. Please try again next time',
  };
};

export default {
  login,
  register,
  getOwnAccountDetails,
  updateOwnAccountDetails,
};
