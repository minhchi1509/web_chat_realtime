'use client';

import { useRouter } from 'next-nprogress-bar';
import { useEffect } from 'react';

import ConversationList from 'src/components/ui/features/chat/ConversationList';
import SearchChatMembers from 'src/components/ui/features/chat/SearchChatMembers';
import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';
import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import useGetConversations from 'src/hooks/cache/useGetConversations';

const MessagesPage = () => {
  const { push } = useRouter();
  const { data: allFetchedConversationPages } = useGetConversations({});

  useEffect(() => {
    if (
      allFetchedConversationPages &&
      allFetchedConversationPages.pages.length &&
      allFetchedConversationPages.pages[0].data.length
    ) {
      const firstConversation = allFetchedConversationPages.pages[0].data[0];
      push(`/messages/${firstConversation.id}`);
    }
  }, [allFetchedConversationPages, push]);

  if (
    allFetchedConversationPages &&
    allFetchedConversationPages.pages.length &&
    allFetchedConversationPages.pages[0].data.length === 0
  ) {
    return (
      <div className="h-[calc(100vh-56px)] py-4 sm:py-8">
        <PlayholderContent cardContentClassName="p-0 h-full" className="h-full">
          <div className="flex h-full">
            <div className="flex flex-[3] flex-col border-r border-muted p-6 pr-4">
              <SearchChatMembers />
              <ConversationList />
            </div>
            <div className="flex flex-[8] items-center justify-center">
              <p className="text-center text-2xl font-medium text-muted-foreground">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        </PlayholderContent>
      </div>
    );
  }

  return <LoadingStatus />;
};

export default MessagesPage;
