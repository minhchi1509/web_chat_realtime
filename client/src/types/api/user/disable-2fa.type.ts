import { TUserResponse } from 'src/types/api/model.type';

export type TDisable2FABody = {
  password: string;
};
export type TDisable2FAResponse = {
  message: string;
  user: TUserResponse;
};
