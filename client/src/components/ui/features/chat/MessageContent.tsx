import { useParams } from 'next/navigation';
import { FC } from 'react';
import ChatAvatarStatus from 'src/components/ui/features/chat/ChatAvatarStatus';

import MediaMessageRender from 'src/components/ui/features/chat/MediaMessageRender';
import MessageActions from 'src/components/ui/features/chat/MessageActions';
import MessageReactionDetail from 'src/components/ui/features/chat/MessageReactionDetail';
import RepliedMessage from 'src/components/ui/features/chat/RepliedMessage';
import RevokedMessageRender from 'src/components/ui/features/chat/RevokedMessageRender';
import TextMessageRender from 'src/components/ui/features/chat/TextMessageRender';
import { useConversationStore } from 'src/store/useConversationStore';
import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { EMessageMediaType, EMessageType } from 'src/types/api/model.type';
import { cn } from 'src/utils/common.util';

interface IMessageContentProps {
  message: TConversationMessageResponse & {
    shouldShowSeperateTime: boolean;
  };
  isMessageSendByMe: boolean;
  isFirstMessage: boolean;
  isLastMessage: boolean;
}

const MessageContent: FC<IMessageContentProps> = ({
  message,
  isFirstMessage,
  isLastMessage,
  isMessageSendByMe
}) => {
  const params = useParams<{ conversationId: string }>();
  const { currentMessageActions } = useConversationStore();
  const isMessageIcon = message.type === EMessageType.ICON;
  const isMessageRevoked = message.isRevokedForEveryone;

  const mediaType = message.mediaList?.[0]?.type;

  const renderMessageContentByType = () => {
    const { isRevokedForEveryone, type: messageType } = message;
    if (isRevokedForEveryone) {
      return <RevokedMessageRender isMessageSendByMe={isMessageSendByMe} />;
    }
    if (
      messageType === EMessageType.TEXT ||
      messageType === EMessageType.ICON
    ) {
      return (
        <TextMessageRender
          message={message}
          isMessageSendByMe={isMessageSendByMe}
        />
      );
    }
    if (messageType === EMessageType.MEDIA) {
      return (
        <MediaMessageRender
          message={message}
          isMessageSendByMe={isMessageSendByMe}
        />
      );
    }
  };

  return (
    <div className={cn('flex flex-col w-full group')}>
      <div className={cn('flex', isMessageSendByMe && 'self-end')}>
        {!isMessageSendByMe && (
          <div
            className={cn('size-7 mr-2 shrink-0 self-end', {
              'mb-[18px]': isLastMessage && message.reactionsData.total > 0
            })}
          >
            {isLastMessage && (
              <ChatAvatarStatus
                src={message?.sender?.profile.avatar || ''}
                size={28}
              />
            )}
          </div>
        )}
        <div className={cn('flex flex-col')}>
          {isFirstMessage && !isMessageSendByMe && !message.replyToMessage && (
            <span className="text-xs text-muted-foreground my-1">
              {message.sender?.profile.fullName}
            </span>
          )}
          {message.replyToMessage && (
            <RepliedMessage
              message={message}
              isMessageSendByMe={isMessageSendByMe}
            />
          )}
          <div
            className={cn('flex items-center', {
              'flex-row-reverse': isMessageSendByMe
            })}
          >
            <div className="flex flex-col">
              <div
                className={cn(
                  'relative',
                  (!isMessageIcon || isMessageRevoked) &&
                    mediaType !== EMessageMediaType.PHOTO &&
                    (isMessageSendByMe
                      ? {
                          'rounded-[18px] rounded-br-[4px]': isFirstMessage,
                          'rounded-[18px] rounded-tr-[4px]': isLastMessage,
                          'rounded-[18px]': isFirstMessage && isLastMessage,
                          'rounded-[18px] rounded-r-[4px]':
                            !isFirstMessage && !isLastMessage
                        }
                      : {
                          'rounded-[18px] rounded-bl-[4px]': isFirstMessage,
                          'rounded-[18px] rounded-tl-[4px]': isLastMessage,
                          'rounded-[18px]': isFirstMessage && isLastMessage,
                          'rounded-[18px] rounded-l-[4px]':
                            !isFirstMessage && !isLastMessage
                        })
                )}
              >
                {renderMessageContentByType()}
              </div>
              {message.reactionsData.total > 0 && (
                <MessageReactionDetail
                  conversationId={params.conversationId}
                  messageId={message.id}
                  reactionsData={message.reactionsData}
                />
              )}
            </div>
            <MessageActions
              conversationId={params.conversationId}
              isMessageSendByMe={isMessageSendByMe}
              message={message}
              className={cn('transition-opacity duration-100', {
                'group-hover:opacity-100 opacity-0':
                  currentMessageActions.messageId !== message.id
              })}
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-end">
          <div className="flex gap-2">
            {message.seenBy.map((participant) => (
              <ChatAvatarStatus
                key={participant.id}
                src={participant.profile.avatar}
                size={16}
                className="cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageContent;
