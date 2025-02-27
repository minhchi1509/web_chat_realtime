export type TOAuthLoginBody = {
  oauthToken: string;
  otpCode?: string;
  password?: string;
};

export type TOAuthLoginRequest = {
  body: TOAuthLoginBody;
};
