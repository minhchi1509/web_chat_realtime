import { ELoginType } from 'src/constants/enum';

export type TLoginPageRedirectState = {
  loginType: ELoginType;
  email: string;
  password: string;
  googleIdToken: string;
};
