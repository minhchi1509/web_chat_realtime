/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

import { useSocketStore } from 'src/store/useSocketStore';

const ChatSocketListener = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const chatSocket = useSocketStore((state) => state.getSocket('/chat'));
  const params = useParams();
  const conversationIdParam: string | undefined = params.conversationId as
    | string
    | undefined;

  useEffect(() => {
    chatSocket.on('conversation_detail_updated', async (payload) => {
      if (payload.conversationId === conversationIdParam) {
        await queryClient.invalidateQueries({
          queryKey: [
            'conversation-messages',
            { conversationId: payload.conversationId }
          ]
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({
          queryKey: [
            'conversationDetails',
            { conversationId: payload.conversationId }
          ]
        })
      ]);
    });

    chatSocket.on('user_activity_status', async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['chatMembers'] }),
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({
          queryKey: ['conversationDetails']
        })
      ]);
    });

    return () => {
      chatSocket.off('conversation_detail_updated');
      chatSocket.off('user_activity_status');
    };
  }, [chatSocket]);

  return <>{children}</>;
};

export default ChatSocketListener;
