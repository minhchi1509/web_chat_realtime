/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';

import { useSocketStore } from 'src/hooks/zustand/useSocketStore';

const ChatSocketListener = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const chatSocket = useSocketStore((state) => state.getSocket('/chat'));

  useEffect(() => {
    chatSocket.on('new_message', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: [
          'conversation-messages',
          { conversationId: payload.conversationId }
        ]
      });
      queryClient.invalidateQueries({
        queryKey: [
          'conversationDetails',
          { conversationId: payload.conversationId }
        ]
      });
    });

    chatSocket.on('user_activity_status', () => {
      queryClient.invalidateQueries({ queryKey: ['chatMembers'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['conversationDetails']
      });
    });

    return () => {
      chatSocket.off('new_message');
      chatSocket.off('user_activity_status');
    };
  }, [chatSocket]);

  return <>{children}</>;
};

export default ChatSocketListener;
