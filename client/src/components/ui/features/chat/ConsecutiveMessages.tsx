import { FC } from 'react';

import MessageContent from 'src/components/ui/features/chat/MessageContent';
import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { formatMessageTimeLine } from 'src/utils/common.util';
import { isCurrentUser } from 'src/utils/message.util';

interface IConsecutiveMessagesProps {
  messages: (TConversationMessageResponse & {
    shouldShowSeperateTime: boolean;
  })[];
}
const ConsecutiveMessages: FC<IConsecutiveMessagesProps> = ({ messages }) => {
  const isMessageSendByMe = isCurrentUser(messages[0].sender?.profile.id);

  return (
    <div className="flex w-full max-w-full flex-col">
      {messages[0].shouldShowSeperateTime && (
        <div className="px-5 py-4">
          <p className="text-center text-xs text-muted-foreground">
            {formatMessageTimeLine(messages[0].createdAt)}
          </p>
        </div>
      )}
      <div className="flex w-full flex-col gap-0.5">
        {messages.map((message, index) => (
          <MessageContent
            key={message.id}
            message={message}
            isFirstMessage={index === 0}
            isLastMessage={index === messages.length - 1}
            isMessageSendByMe={isMessageSendByMe}
          />
        ))}
      </div>
    </div>
  );
};

export default ConsecutiveMessages;
