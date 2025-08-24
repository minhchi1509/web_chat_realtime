import Image from 'next/image';
import React, { FC, useEffect } from 'react';
import ChatAvatarStatus from 'src/components/ui/features/chat/ChatAvatarStatus';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from 'src/components/ui/shadcn-ui/dialog';
import { ScrollArea, ScrollBar } from 'src/components/ui/shadcn-ui/scroll-area';
import { removeMessageEmotion } from 'src/services/chat.service';
import { TMessageReactionsData } from 'src/types/api/chat/get-conversation-messages.type';
import { TMessageEmotionResponse } from 'src/types/api/model.type';
import { TErrorData } from 'src/types/error-response.type';
import { cn } from 'src/utils/common.util';
import {
  getEmojiDisplayUrl,
  isCurrentUser,
  sortMessageReactions
} from 'src/utils/message.util';
import { showErrorToast } from 'src/utils/toast.util';

interface IMessageReactionDetailProps {
  messageId: string;
  conversationId: string;
  reactionsData: TMessageReactionsData;
}

const MessageReactionDetail: FC<IMessageReactionDetailProps> = ({
  messageId,
  conversationId,
  reactionsData
}) => {
  const [openReactionsDialog, setOpenReactionsDialog] = React.useState(false);
  const [selectedTabKey, setSelectedTabKey] = React.useState<string>('ALL');

  const { sortedReactionsKey, formattedReactions } = sortMessageReactions(
    reactionsData.data
  );

  const handleOpenReactionsDialog = () => {
    setOpenReactionsDialog(true);
  };

  const handleRemoveReaction = async (reaction: TMessageEmotionResponse) => {
    if (!isCurrentUser(reaction.participant.profile.id)) return;
    try {
      await removeMessageEmotion({ messageId, conversationId });
    } catch (error) {
      showErrorToast((error as TErrorData).message);
    }
  };

  useEffect(() => {
    if (!formattedReactions[selectedTabKey]) {
      setSelectedTabKey('ALL');
    }
  }, [formattedReactions, selectedTabKey]);

  return (
    <Dialog open={openReactionsDialog} onOpenChange={setOpenReactionsDialog}>
      <DialogTrigger asChild>
        <div className="relative w-full h-[18px]">
          <div
            className="flex items-center absolute right-0 -top-2 p-0.5 rounded-full bg-white dark:bg-black cursor-pointer shadow-md"
            onClick={handleOpenReactionsDialog}
          >
            {reactionsData.topReactions.map((emojiCode) => (
              <Image
                key={emojiCode}
                width={18}
                height={18}
                alt="message-emotion"
                className="size-[18px]"
                src={getEmojiDisplayUrl(emojiCode)}
              />
            ))}
            {reactionsData.total > 1 && (
              <span className="text-muted-foreground text-[11px] mx-1">
                {reactionsData.total}
              </span>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Message reactions
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col overflow-hidden max-w-full max-h-[400px]">
          <ScrollArea className="pb-3">
            <div data-slot="tabs-list" className="flex">
              {sortedReactionsKey.map((emojiCode) => {
                const isActive = selectedTabKey === emojiCode;

                return (
                  <div className="h-[60px] flex flex-col w-fit" key={emojiCode}>
                    <div
                      className="flex-1 flex px-4 items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
                      onClick={() => setSelectedTabKey(emojiCode)}
                    >
                      {emojiCode === 'ALL' ? (
                        <span
                          className={cn(
                            'text-[15px] font-semibold whitespace-nowrap',
                            isActive
                              ? 'text-[#0064d1] dark:text-[#5aa7ff]'
                              : 'text-[#65686c] dark:text-[#b0b3b8]'
                          )}
                        >
                          All {reactionsData.total}
                        </span>
                      ) : (
                        <div className="flex gap-1">
                          <Image
                            key={emojiCode}
                            width={20}
                            height={20}
                            alt="message-emotion"
                            className="size-[20px] shrink-0"
                            src={getEmojiDisplayUrl(emojiCode)}
                          />
                          <span
                            className={cn(
                              'text-[15px] font-semibold',
                              isActive
                                ? 'text-[#0064d1] dark:text-[#5aa7ff]'
                                : 'text-[#65686c] dark:text-[#b0b3b8]'
                            )}
                          >
                            {formattedReactions[emojiCode]?.length || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={cn(
                        'w-full h-[3px]',
                        isActive ? 'bg-[#0866FF]' : 'bg-transparent'
                      )}
                    ></div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                {formattedReactions[selectedTabKey]?.map((reaction) => (
                  <div
                    key={reaction.id}
                    className="h-[56px] flex items-center px-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 rounded-md"
                    onClick={() => handleRemoveReaction(reaction)}
                  >
                    <ChatAvatarStatus
                      size={40}
                      className="shrink-0 mr-2"
                      src={reaction.participant.profile.avatar}
                    />

                    <div className="flex flex-col flex-1">
                      <span className="text-[15px] font-medium text-[#080809] dark:text-[#e4e6eb]">
                        {reaction.participant.profile.fullName}
                      </span>
                      {isCurrentUser(reaction.participant.profile.id) && (
                        <span className="text-muted-foreground text-xs line-clamp-1">
                          Click to remove
                        </span>
                      )}
                    </div>
                    <Image
                      width={28}
                      height={28}
                      alt="message-emotion"
                      className="size-7 shrink-0"
                      src={getEmojiDisplayUrl(reaction.emojiCode)}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReactionDetail;
