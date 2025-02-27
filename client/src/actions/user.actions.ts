'use server';
import axiosInstance from 'src/configs/http-request.config';
import { TUserResponse } from 'src/types/api/model.type';
import {
  TChangePasswordRequest,
  TChangePasswordResponse
} from 'src/types/api/user/change-password.type';
import {
  TDisable2FARequest,
  TDisable2FAResponse
} from 'src/types/api/user/disable-2fa.type';
import {
  TEnable2FARequest,
  TEnable2FAResponse
} from 'src/types/api/user/enable-2fa.type';
import { TGenerate2FAResponse } from 'src/types/api/user/generate-2fa.type';
import { TUpdateProfileResponse } from 'src/types/api/user/update-profile.type';
import { withSafeServerAction } from 'src/utils/common.util';

export const getUserProfile = withSafeServerAction(async () => {
  const { data } = await axiosInstance.get<TUserResponse>(
    '/api/v1/user/profile'
  );
  return data;
});

export const updateUserProfile = withSafeServerAction(
  async (body: FormData) => {
    const { data } = await axiosInstance.put<TUpdateProfileResponse>(
      '/api/v1/user/profile',
      body,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return data;
  }
);

export const changePassword = withSafeServerAction(
  async (req: TChangePasswordRequest) => {
    const { data } = await axiosInstance.put<TChangePasswordResponse>(
      '/api/v1/user/password',
      req.body
    );
    return data;
  }
);

export const generate2FA = withSafeServerAction(async () => {
  const { data } = await axiosInstance.get<TGenerate2FAResponse>(
    '/api/v1/user/generate-2fa'
  );
  return data;
});

export const enable2FA = withSafeServerAction(
  async (req: TEnable2FARequest) => {
    const { data } = await axiosInstance.put<TEnable2FAResponse>(
      '/api/v1/user/enable-2fa',
      req.body
    );
    return data;
  }
);

export const disable2FA = withSafeServerAction(
  async (req: TDisable2FARequest) => {
    const { data } = await axiosInstance.put<TDisable2FAResponse>(
      '/api/v1/user/disable-2fa',
      req.body
    );
    return data;
  }
);

export const logOut = withSafeServerAction(async () => {
  await axiosInstance.post('/api/v1/user/logout', {});
});
