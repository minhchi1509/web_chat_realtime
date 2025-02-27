import { useQuery } from '@tanstack/react-query';

import { getConversationDetails } from 'src/actions/chat.actions';
import { executeServerAction } from 'src/utils/common.util';

const useGetConversationDetails = (conversationId: string) => {
  const query = useQuery({
    queryKey: ['conversationDetails', { conversationId }],
    queryFn: () =>
      executeServerAction(() => getConversationDetails(conversationId))
  });
  return query;
};

export default useGetConversationDetails;
