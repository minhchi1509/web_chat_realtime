'use client';
import { useParams } from 'next/navigation';
import { FC } from 'react';

import ConversationList from 'src/components/ui/features/chat/ConversationList';
import ConversationMessages from 'src/components/ui/features/chat/ConversationMessages';
import SearchChatMembers from 'src/components/ui/features/chat/SearchChatMembers';
import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';
import { EMediaQuery } from 'src/constants/enum';
import { useConversationStore } from 'src/store/useConversationStore';
import { IBasePageProps } from 'src/types/common.type';
import { cn } from 'src/utils/common.util';
import { useMediaQuery } from 'usehooks-ts';

const ConversationDetailPage: FC<
  IBasePageProps<{ conversationId: string }>
> = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { showListConversationsBlock } = useConversationStore();
  const isMobile = useMediaQuery(EMediaQuery.MOBILE);

  return (
    <div className="h-[calc(100vh-56px)] py-4 sm:py-8">
      <PlayholderContent
        cardContentClassName="p-0 h-full"
        className="h-full py-0 border-solid border border-zinc-100 dark:border-zinc-700"
      >
        <div className="flex h-full">
          <div
            className={cn(
              'flex flex-[3] flex-col overflow-hidden border-r border-muted p-6 pr-4',
              isMobile && (showListConversationsBlock ? 'flex-1' : 'hidden')
            )}
          >
            <SearchChatMembers />
            <ConversationList />
          </div>
          <div
            className={cn(
              'flex-[8] overflow-hidden',
              isMobile && (showListConversationsBlock ? 'hidden' : 'flex-1')
            )}
          >
            <ConversationMessages conversationId={conversationId} />
          </div>
        </div>
      </PlayholderContent>
    </div>
  );
};

export default ConversationDetailPage;
