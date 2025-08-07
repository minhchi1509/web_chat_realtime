import { useInfiniteQuery } from '@tanstack/react-query';

import { chatService } from 'src/services';
import { TPaginationQuery } from 'src/types/common.type';

const useGetConversations = ({
  page = 1,
  pageSize = 5
}: Partial<TPaginationQuery>) => {
  return useInfiniteQuery({
    queryKey: ['conversations', { page, pageSize }],
    queryFn: async ({ pageParam }) =>
      chatService.getConversations({ page: pageParam, pageSize }),
    initialPageParam: page,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    }
  });
};

export default useGetConversations;
