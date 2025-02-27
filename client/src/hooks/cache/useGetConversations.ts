import { useInfiniteQuery } from '@tanstack/react-query';

import { getConversations } from 'src/actions/chat.actions';
import { TPaginationQuery } from 'src/types/common.type';
import { executeServerAction } from 'src/utils/common.util';

const useGetConversations = ({
  page = 1,
  pageSize = 5
}: Partial<TPaginationQuery>) => {
  return useInfiniteQuery({
    queryKey: ['conversations', { page, pageSize }],
    queryFn: async ({ pageParam }) =>
      executeServerAction(() =>
        getConversations({ page: pageParam, pageSize })
      ),
    initialPageParam: page,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    }
  });
};

export default useGetConversations;
