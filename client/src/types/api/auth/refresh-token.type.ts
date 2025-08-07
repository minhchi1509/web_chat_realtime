import { TUserResponse } from 'src/types/api/model.type';

export type TRefreshTokenResponse = {
  message: string;
  user: TUserResponse;
};
