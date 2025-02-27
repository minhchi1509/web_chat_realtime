import { TUserResponse } from 'src/types/api/model.type';

type TEnable2FABody = {
  otpCode: string;
};

export type TEnable2FARequest = {
  body: TEnable2FABody;
};

export type TEnable2FAResponse = {
  message: string;
  user: TUserResponse;
};
