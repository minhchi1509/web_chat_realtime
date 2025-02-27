import { TUserResponse } from 'src/types/api/model.type';

type TDisable2FABody = {
  password: string;
};

export type TDisable2FARequest = {
  body: TDisable2FABody;
};

export type TDisable2FAResponse = {
  message: string;
  user: TUserResponse;
};
