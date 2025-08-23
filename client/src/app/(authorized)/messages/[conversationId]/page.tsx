import { FC } from 'react';

import ConversationList from 'src/components/ui/features/chat/ConversationList';
import ConversationMessages from 'src/components/ui/features/chat/ConversationMessages';
import SearchChatMembers from 'src/components/ui/features/chat/SearchChatMembers';
import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';
import { IBasePageProps } from 'src/types/common.type';

const ConversationDetailPage: FC<
  IBasePageProps<{ conversationId: string }>
> = async ({ params }) => {
  const { conversationId } = await params;

  return (
    <div className="h-[calc(100vh-56px)] py-4 sm:py-8">
      <PlayholderContent
        cardContentClassName="p-0 h-full"
        className="h-full py-0 border-solid border border-zinc-100 dark:border-zinc-700"
      >
        <div className="flex h-full">
          <div className="flex flex-[3] flex-col overflow-hidden border-r border-muted p-6 pr-4">
            <SearchChatMembers />
            <ConversationList />
          </div>
          <div className="flex-[8] overflow-hidden">
            <ConversationMessages conversationId={conversationId} />
          </div>
        </div>
      </PlayholderContent>
    </div>
  );
};

export default ConversationDetailPage;
