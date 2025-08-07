import axiosInstance from 'src/configs/axios.config';
import {
  TForgotPasswordBody,
  TForgotPasswordResponse
} from 'src/types/api/auth/forgot-password.type';
import { TLoginBody, TLoginResponse } from 'src/types/api/auth/login.type';
import { TRefreshTokenResponse } from 'src/types/api/auth/refresh-token.type';
import {
  TResetPasswordBody,
  TResetPasswordResponse
} from 'src/types/api/auth/reset-password.type';
import { TSignupBody, TSignupResponse } from 'src/types/api/auth/signup.type';
import {
  TVerifyTwoFactorAuthBody,
  TVerifyTwoFactorAuthResponse
} from 'src/types/api/auth/verify-two-factor-auth.type';

export const login = async (body: TLoginBody) => {
  const { data } = await axiosInstance.post<TLoginResponse>(
    '/api/v1/auth/login',
    body
  );
  return data;
};

export const signup = async (body: TSignupBody) => {
  const { data } = await axiosInstance.post<TSignupResponse>(
    '/api/v1/auth/signup',
    body
  );
  return data;
};

export const sendResetPasswordEmail = async (body: TForgotPasswordBody) => {
  const { data } = await axiosInstance.post<TForgotPasswordResponse>(
    '/api/v1/auth/send-reset-password-mail',
    body
  );
  return data;
};

export const resetPassword = async (
  token: string,
  body: TResetPasswordBody
) => {
  const { data } = await axiosInstance.put<TResetPasswordResponse>(
    '/api/v1/auth/reset-password',
    body,
    {
      headers: {
        'x-reset-password-token': token
      }
    }
  );
  return data;
};

export const refreshToken = async () => {
  const { data } = await axiosInstance.post<TRefreshTokenResponse>(
    '/api/v1/auth/refresh-token'
  );
  return data;
};

export const verifyTwoFactorAuthentication = async (
  body: TVerifyTwoFactorAuthBody
) => {
  const { data } = await axiosInstance.post<TVerifyTwoFactorAuthResponse>(
    '/api/v1/auth/verify-two-factor-auth',
    body
  );
  return data;
};

export const initOAuthPassword = async (token: string, password: string) => {
  const { data } = await axiosInstance.post<TResetPasswordResponse>(
    '/api/v1/oauth/init-password',
    {
      password
    },
    {
      headers: {
        'x-init-oauth-password-token': token
      }
    }
  );
  return data;
};
