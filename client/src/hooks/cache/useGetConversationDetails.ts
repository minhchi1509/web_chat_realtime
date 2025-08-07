import { useQuery } from '@tanstack/react-query';

import { chatService } from 'src/services';

const useGetConversationDetails = (conversationId: string) => {
  const query = useQuery({
    queryKey: ['conversationDetails', { conversationId }],
    queryFn: () => chatService.getConversationDetails(conversationId)
  });
  return query;
};

export default useGetConversationDetails;
