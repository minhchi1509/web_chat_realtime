import { useInfiniteQuery } from '@tanstack/react-query';

import { chatService } from 'src/services';
import { TGetChatMembersQuery } from 'src/types/api/chat/get-chat-members.type';

const useSearchChatMembers = (
  { page = 1, pageSize = 5, searchKey = '' }: Partial<TGetChatMembersQuery>,
  enabled: boolean
) => {
  return useInfiniteQuery({
    queryKey: ['chatMembers', { page, pageSize, searchKey }],
    queryFn: async ({ pageParam }) =>
      chatService.getChatMembers({ page: pageParam, pageSize, searchKey }),
    initialPageParam: page,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    enabled
  });
};

export default useSearchChatMembers;
