'use server';
import axiosInstance from 'src/configs/http-request.config';
import {
  TForgotPasswordRequest,
  TForgotPasswordResponse
} from 'src/types/api/auth/forgot-password.type';
import { TLoginRequest, TLoginResponse } from 'src/types/api/auth/login.type';
import { TOAuthLoginRequest } from 'src/types/api/auth/oauth-login.type';
import {
  TRefreshTokenRequest,
  TRefreshTokenResponse
} from 'src/types/api/auth/refresh-token.type';
import {
  TResetPasswordRequest,
  TResetPasswordResponse
} from 'src/types/api/auth/reset-password.type';
import {
  TSignupRequest,
  TSignupResponse
} from 'src/types/api/auth/signup.type';
import { withSafeServerAction } from 'src/utils/common.util';

export const login = withSafeServerAction(async (req: TLoginRequest) => {
  const { data } = await axiosInstance.post<TLoginResponse>(
    '/api/v1/auth/login',
    req.body
  );
  return data;
});

export const signup = withSafeServerAction(async (req: TSignupRequest) => {
  const { data } = await axiosInstance.post<TSignupResponse>(
    '/api/v1/auth/signup',
    req.body
  );
  return data;
});

export const loginWithGoogle = withSafeServerAction(
  async (req: TOAuthLoginRequest) => {
    const { data } = await axiosInstance.post<TLoginResponse>(
      '/api/v1/oauth/google/login',
      req.body
    );
    return data;
  }
);

export const sendResetPasswordEmail = withSafeServerAction(
  async (req: TForgotPasswordRequest) => {
    const { data } = await axiosInstance.post<TForgotPasswordResponse>(
      '/api/v1/auth/send-reset-password-mail',
      req.body
    );
    return data;
  }
);

export const resetPassword = withSafeServerAction(
  async (req: TResetPasswordRequest) => {
    const { data } = await axiosInstance.put<TResetPasswordResponse>(
      '/api/v1/auth/reset-password',
      req.body
    );
    return data;
  }
);

export const refreshToken = withSafeServerAction(
  async (req: TRefreshTokenRequest) => {
    const { data } = await axiosInstance.post<TRefreshTokenResponse>(
      '/api/v1/auth/refresh-token',
      req.body
    );
    return data;
  }
);
