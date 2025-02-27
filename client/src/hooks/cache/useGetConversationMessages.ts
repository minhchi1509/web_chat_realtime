import { useInfiniteQuery } from '@tanstack/react-query';

import { getConversationMessages } from 'src/actions/chat.actions';
import { TPaginationQuery } from 'src/types/common.type';
import { executeServerAction } from 'src/utils/common.util';

export const useGetConversationMessages = (
  conversationId: string,
  { page = 1, pageSize = 10 }: Partial<TPaginationQuery>
) => {
  return useInfiniteQuery({
    queryKey: ['conversation-messages', { conversationId }],
    queryFn: async ({ pageParam }) =>
      executeServerAction(() =>
        getConversationMessages(conversationId, { page: pageParam, pageSize })
      ),
    initialPageParam: page,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    }
  });
};
