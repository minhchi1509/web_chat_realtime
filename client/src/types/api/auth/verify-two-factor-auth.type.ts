import { TUserResponse } from 'src/types/api/model.type';

export type TVerifyTwoFactorAuthBody = {
  otpCode: string;
};

export type TVerifyTwoFactorAuthResponse = {
  user: TUserResponse;
};
