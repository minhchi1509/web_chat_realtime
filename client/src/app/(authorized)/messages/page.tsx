'use client';
import ConversationList from 'src/components/ui/features/chat/ConversationList';
import SearchChatMembers from 'src/components/ui/features/chat/SearchChatMembers';
import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';

const MessagesPage = () => {
  return (
    <div className="h-[calc(100vh-56px)] py-4 sm:py-8">
      <PlayholderContent
        cardContentClassName="p-0 h-full"
        className="h-full py-0 border-solid border border-zinc-100 dark:border-zinc-700"
      >
        <div className="flex h-full">
          <div className="flex flex-1 md:flex-[3] flex-col overflow-hidden border-r border-muted p-6 pr-4">
            <SearchChatMembers />
            <ConversationList />
          </div>
          <div className="hidden md:flex flex-[8] items-center justify-center">
            <p className="text-center text-2xl font-medium text-muted-foreground">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      </PlayholderContent>
    </div>
  );
};

export default MessagesPage;
