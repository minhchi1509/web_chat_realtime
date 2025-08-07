import axiosInstance from 'src/configs/axios.config';
import { TUserResponse } from 'src/types/api/model.type';
import {
  TChangePasswordBody,
  TChangePasswordResponse
} from 'src/types/api/user/change-password.type';
import {
  TDisable2FABody,
  TDisable2FAResponse
} from 'src/types/api/user/disable-2fa.type';
import {
  TEnable2FABody,
  TEnable2FAResponse
} from 'src/types/api/user/enable-2fa.type';
import { TGenerate2FAResponse } from 'src/types/api/user/generate-2fa.type';
import { TUpdateProfileResponse } from 'src/types/api/user/update-profile.type';

export const getUserProfile = async () => {
  const { data } = await axiosInstance.get<TUserResponse>(
    '/api/v1/user/profile'
  );
  return data;
};

export const updateUserProfile = async (body: FormData) => {
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
};

export const changePassword = async (body: TChangePasswordBody) => {
  const { data } = await axiosInstance.put<TChangePasswordResponse>(
    '/api/v1/user/password',
    body
  );
  return data;
};

export const generate2FA = async () => {
  const { data } = await axiosInstance.get<TGenerate2FAResponse>(
    '/api/v1/user/generate-2fa'
  );
  return data;
};

export const enable2FA = async (body: TEnable2FABody) => {
  const { data } = await axiosInstance.put<TEnable2FAResponse>(
    '/api/v1/user/enable-2fa',
    body
  );
  return data;
};

export const disable2FA = async (body: TDisable2FABody) => {
  const { data } = await axiosInstance.put<TDisable2FAResponse>(
    '/api/v1/user/disable-2fa',
    body
  );
  return data;
};

export const logOut = async () => {
  await axiosInstance.post('/api/v1/user/logout', {});
};
