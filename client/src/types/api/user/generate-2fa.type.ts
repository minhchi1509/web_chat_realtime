import { TUserResponse } from 'src/types/api/model.type';

export type TGenerate2FAResponse = {
  user: TUserResponse;
  qrCodeUrl: string;
  secretKey: string;
};
