import { TUserResponse } from 'src/types/api/model.type';

export type TUpdateProfileResponse = {
  message: string;
  updatedUser: TUserResponse;
};
