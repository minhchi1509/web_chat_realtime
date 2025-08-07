import { EOAuthProvider } from 'src/common/constants/common.enum';

export type TJWTPayload = {
  sub: string;
  email: string;
};

export type TOAuthProfile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  provider: EOAuthProvider;
  accessToken: string;
  refreshToken: string;
};

export type TJWTResetPasswordPayload = {
  email: string;
};

export type TJWTOAuthPayload = {
  email: string;
  fullName: string;
  avatarUrl: string;
  provider: EOAuthProvider;
};

export type TJWTTwoFactorAuthPayload = {
  userId: string;
  email: string;
};

export type TSignTokenResponse = {
  token: string;
  expiresIn: number;
};

export type TGithubUserResponse = {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
};
