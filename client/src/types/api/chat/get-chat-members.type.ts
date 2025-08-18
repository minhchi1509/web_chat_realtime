import { TUserResponse } from 'src/types/api/model.type';
import { TGetListResponse, TPaginationQuery } from 'src/types/common.type';

export type TGetChatMembersQuery = TPaginationQuery & {
  searchKey: string;
};

type TGetChatMemberResponse = {
  profile: Omit<TUserResponse, 'email' | 'isEnableTwoFactorAuth'>;
  isOnline: boolean;
};

export type TGetChatMembersResponse = TGetListResponse<TGetChatMemberResponse>;
