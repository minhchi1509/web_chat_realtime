'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next-nprogress-bar';
import React from 'react';

import ChatAvatarStatus from 'src/components/ui/features/chat/ChatAvatarStatus';
import InfiniteScroller from 'src/components/ui/shared/infinite-scrollers';
import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import useGetConversations from 'src/hooks/cache/useGetConversations';
import { cn, formatTimeAgo } from 'src/utils/common.util';

const ConversationList = () => {
  const { push } = useRouter();
  const params = useParams();
  const {
    data: allFetchedConversations,
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useGetConversations({});

  return (
    <div className="relative mt-3 flex flex-1 flex-col overflow-auto">
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Last conversations
      </p>
      {isLoading && <LoadingSpinner className="mt-5" />}
      {allFetchedConversations && (
        <>
          {allFetchedConversations.pages[0].data.length === 0 && (
            <div className="center-xy size-fit">
              <p className="text-sm text-muted-foreground">
                No conversation found
              </p>
            </div>
          )}
          <InfiniteScroller
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            className="flex flex-1 flex-col gap-2 overflow-auto"
          >
            {allFetchedConversations.pages.map((page) =>
              page.data.map((conversation, index) => (
                <div
                  className={cn(
                    'flex items-center rounded-md p-3 duration-200 hover:cursor-pointer',
                    params.conversationId === conversation.id &&
                      'bg-slate-100 dark:bg-slate-800',
                    params.conversationId !== conversation.id &&
                      'hover:bg-muted'
                  )}
                  key={index}
                  onClick={() => push(`/messages/${conversation.id}`)}
                >
                  <div className="relative mr-3.5">
                    <ChatAvatarStatus
                      size={50}
                      src={conversation.thumbnail}
                      isOnline={conversation.isOnline}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium">
                        {conversation.name}
                      </p>
                      {!conversation.lastMessage.isSeen && (
                        <div className="size-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <p
                      className={cn(
                        'line-clamp-1 text-xs text-muted-foreground',
                        !conversation.lastMessage.isSeen && 'font-bold'
                      )}
                    >
                      {conversation.lastMessage.previewContent}
                    </p>
                  </div>
                  <p className="ml-2 text-xs text-muted-foreground">
                    {formatTimeAgo(conversation.lastMessage.createdAt)}
                  </p>
                </div>
              ))
            )}
          </InfiniteScroller>
        </>
      )}
    </div>
  );
};

export default ConversationList;
