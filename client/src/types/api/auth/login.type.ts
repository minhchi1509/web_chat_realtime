import { TUserResponse } from 'src/types/api/model.type';

export type TLoginBody = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  user: TUserResponse;
};
