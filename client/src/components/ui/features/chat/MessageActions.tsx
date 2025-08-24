import React from 'react';

import { ReplyArrowIcon } from 'src/assets/icons';
import MessageMoreAction from 'src/components/ui/features/chat/MessageMoreAction';
import MessageReactionPopover from 'src/components/ui/features/chat/MessageReactionPopover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import { useConversationStore } from 'src/store/useConversationStore';
import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { cn } from 'src/utils/common.util';

interface IMessageActionsProps {
  conversationId: string;
  isMessageSendByMe: boolean;
  message: TConversationMessageResponse;
  className?: string;
}

const MessageActions: React.FC<IMessageActionsProps> = ({
  message,
  isMessageSendByMe,
  conversationId,
  className
}) => {
  const { setCurrentReplyMessage } = useConversationStore();
  const { canDropEmotion, canReply, canRevoke } = message.actionsOnMessage;
  return (
    <>
      <div
        className={cn(
          'flex shrink-0',
          {
            'flex-row-reverse': isMessageSendByMe
          },
          !isMessageSendByMe ? 'ml-2.5' : 'mr-2.5',
          className
        )}
      >
        {canDropEmotion && (
          <MessageReactionPopover
            conversationId={conversationId}
            messageId={message.id}
          />
        )}
        {canReply && (
          <Tooltip>
            <TooltipTrigger>
              <div
                className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  setCurrentReplyMessage(message);
                }}
              >
                <ReplyArrowIcon
                  width={16}
                  height={16}
                  className="text-[#65686C] dark:text-[#B0B3B8]"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="mb-1">Reply</p>
            </TooltipContent>
          </Tooltip>
        )}
        <MessageMoreAction
          conversationId={conversationId}
          messageId={message.id}
          isMessageSendByMe={isMessageSendByMe}
          canMessageRevoked={canRevoke}
        />
      </div>
    </>
  );
};

export default MessageActions;
