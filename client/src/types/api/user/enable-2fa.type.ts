import { TUserResponse } from 'src/types/api/model.type';

export type TEnable2FABody = {
  otpCode: string;
};

export type TEnable2FAResponse = {
  message: string;
  user: TUserResponse;
};
