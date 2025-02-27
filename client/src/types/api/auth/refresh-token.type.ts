import { TUserResponse } from 'src/types/api/model.type';

type TRefreshTokenBody = {
  refreshToken: string;
};

export type TRefreshTokenRequest = {
  body: TRefreshTokenBody;
};

export type TRefreshTokenResponse = {
  user: TUserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
