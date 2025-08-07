import { TUserResponse } from 'src/types/api/model.type';

export type TResetPasswordBody = {
  newPassword: string;
};

export type TResetPasswordResponse = {
  message: string;
  user: TUserResponse;
};
