import { TUserResponse } from 'src/types/api/model.type';

type TResetPasswordBody = {
  token: string;
  newPassword: string;
};

export type TResetPasswordRequest = {
  body: TResetPasswordBody;
};

export type TResetPasswordResponse = {
  message: string;
  user: TUserResponse;
};
