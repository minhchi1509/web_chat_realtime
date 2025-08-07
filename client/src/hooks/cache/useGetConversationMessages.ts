import { useInfiniteQuery } from '@tanstack/react-query';

import { chatService } from 'src/services';
import { TPaginationQuery } from 'src/types/common.type';

export const useGetConversationMessages = (
  conversationId: string,
  { page = 1, pageSize = 10 }: Partial<TPaginationQuery>
) => {
  return useInfiniteQuery({
    queryKey: ['conversation-messages', { conversationId }],
    queryFn: async ({ pageParam }) =>
      chatService.getConversationMessages(conversationId, {
        page: pageParam,
        pageSize
      }),
    initialPageParam: page,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    }
  });
};
