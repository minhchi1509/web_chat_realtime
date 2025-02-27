import { ELoginType } from 'src/constants/enum';
import { TUserResponse } from 'src/types/api/model.type';

export type TLoginBody = {
  email: string;
  password: string;
  otpCode?: string;
};

export type TLoginRequest = {
  body: TLoginBody;
};

export type TLoginResponse = {
  user: TUserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type TLoginPayload =
  | {
      loginType: ELoginType.EMAIL_PASSWORD;
      email: string;
      password: string;
    }
  | {
      loginType: ELoginType.GOOGLE | ELoginType.GITHUB;
      oauthToken: string;
    };
