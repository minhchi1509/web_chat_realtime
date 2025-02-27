export type TJWTPayload = {
  sub: string;
  email: string;
};

export type TJWTResetPasswordPayload = {
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
