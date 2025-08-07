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
    chatSocket.on('new_conversation_message', async (payload) => {
      console.log({ payload, conversationIdParam });
      if (payload.conversationId === conversationIdParam) {
        chatSocket.emit('user_mark_seen_message', {
          conversationId: payload.conversationId
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({
          queryKey: [
            'conversation-messages',
            { conversationId: payload.conversationId }
          ]
        }),
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

    chatSocket.on('new_seen_message', async (payload) => {
      if (payload.conversationId === conversationIdParam) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['conversations'] }),
          queryClient.invalidateQueries({
            queryKey: [
              'conversation-messages',
              { conversationId: payload.conversationId }
            ]
          })
        ]);
      }
    });

    chatSocket.on('new_message_emotion', async (payload) => {
      if (payload.conversationId === conversationIdParam) {
        await queryClient.invalidateQueries({
          queryKey: [
            'conversation-messages',
            { conversationId: payload.conversationId }
          ]
        });
      }
    });

    return () => {
      chatSocket.off('new_conversation_message');
      chatSocket.off('user_activity_status');
      chatSocket.off('new_seen_message');
      chatSocket.off('new_message_emotion');
    };
  }, [chatSocket]);

  return <>{children}</>;
};

export default ChatSocketListener;
