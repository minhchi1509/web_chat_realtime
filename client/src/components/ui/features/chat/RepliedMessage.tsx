import { PlayIcon } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { AttachmentIcon, ReplyArrowIcon } from 'src/assets/icons';
import { useConversationStore } from 'src/store/useConversationStore';
import {
  TConversationMessageResponse,
  TParentMessageResponse
} from 'src/types/api/chat/get-conversation-messages.type';
import { EMessageMediaType, EMessageType } from 'src/types/api/model.type';
import { cn } from 'src/utils/common.util';
import { isCurrentUser } from 'src/utils/message.util';

interface IRepliedMessageProps {
  message: TConversationMessageResponse;
  isMessageSendByMe: boolean;
}

const getDisplayName = (message: TConversationMessageResponse) => {
  const sender = message.sender;
  const parentMessageSender = message.replyToMessage?.sender;

  const isSenderCurrentUser = isCurrentUser(sender?.profile.id);
  const isParentSenderCurrentUser = isCurrentUser(
    parentMessageSender?.profile.id
  );
  const isSenderSameAsParentSender =
    sender?.profile.id === parentMessageSender?.profile.id;

  const x = isSenderCurrentUser ? 'You' : sender?.profile.fullName;
  const y = isParentSenderCurrentUser
    ? 'you'
    : parentMessageSender?.profile.fullName;

  if (isSenderSameAsParentSender) {
    if (isSenderCurrentUser) {
      return 'You replied to yourself';
    }
    return `${sender?.profile.fullName} replied to themselves`;
  }

  return `${x} replied to ${y}`;
};

const renderReplyMessage = (replyToMessage: TParentMessageResponse) => {
  const messageType = replyToMessage.type;
  const messageMediaType = replyToMessage.mediaList?.[0]?.type;
  const isPhoto = messageMediaType === EMessageMediaType.PHOTO;
  const isVideo = messageMediaType === EMessageMediaType.VIDEO;
  const isFile = messageMediaType === EMessageMediaType.FILE;

  if (
    messageType === EMessageType.TEXT ||
    messageType === EMessageType.ICON ||
    isFile
  ) {
    return (
      <div
        className={cn(
          'h-[45px] w-fit max-w-[467px] py-2 px-3 rounded-[inherit] bg-[rgba(0,0,0,.03)] dark:bg-[rgba(255,255,255,.12)] overflow-hidden'
        )}
      >
        <div className="text-[13px] text-muted-foreground pb-4">
          {isFile ? (
            <div className="flex gap-2 items-center">
              <p className="italic">Attachment</p>
              <AttachmentIcon className="size-4" />
            </div>
          ) : (
            <span className="block truncate">{replyToMessage.content}</span>
          )}
        </div>
      </div>
    );
  }

  if (messageType === EMessageType.MEDIA) {
    if (isPhoto || isVideo) {
      return (
        <div className={cn('size-[100px] rounded-[inherit] relative')}>
          <Image
            src={
              isPhoto
                ? replyToMessage.mediaList[0].url
                : replyToMessage.mediaList[0].url.replaceAll('.mp4', '.jpg')
            }
            alt="Replied media"
            width={100}
            height={100}
            className="rounded-[inherit] aspect-square object-cover"
          />
          <div className="absolute center-xy bg-white/35 rounded-[inherit]"></div>
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[inherit]">
              <div className="size-6 rounded-full border-white border-2 flex items-center justify-center bg-black/80">
                <PlayIcon size={10} fill="white" />
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  return <></>;
};

const RepliedMessage: FC<IRepliedMessageProps> = ({
  message,
  isMessageSendByMe
}) => {
  const { setActiveParentMessageId } = useConversationStore();
  const displayName = getDisplayName(message);

  const handleClickOnParentMessage = () => {
    const parentElement = document.getElementById(
      `message-${message.replyToMessage?.id}`
    );
    if (parentElement) {
      parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveParentMessageId(message.replyToMessage?.id || null);
    }
  };

  return (
    <div className="translate-y-3">
      <div
        className={cn('flex flex-col gap-2', isMessageSendByMe && 'items-end')}
      >
        <div className="flex gap-1 items-center">
          <ReplyArrowIcon className="size-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground leading-0">
            {displayName}
          </span>
        </div>
        <div
          className={cn(
            'rounded-[18px] cursor-pointer overflow-hidden',
            isMessageSendByMe ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'
          )}
          onClick={handleClickOnParentMessage}
        >
          {renderReplyMessage(message.replyToMessage!)}
        </div>
      </div>
    </div>
  );
};

export default RepliedMessage;
