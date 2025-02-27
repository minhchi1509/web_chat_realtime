import { Account, Profile, Session } from 'next-auth';

import { ErrorResponse } from 'src/types/error-response.type';

interface IUserMainProfile {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  isEnableTwoFactorAuth: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface IUserOAuthProfile extends Account, Profile {}

interface IUser {
  mainProfile: IUserMainProfile;
  oAuthProfile?: IUserOAuthProfile;
}

declare module 'next-auth' {
  interface User extends IUser {
    error?: ErrorResponse;
  }
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends Session {}
}
