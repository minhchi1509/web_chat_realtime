import { XIcon } from 'src/assets/icons';
import { useConversationStore } from 'src/store/useConversationStore';
import { EMessageMediaType, EMessageType } from 'src/types/api/model.type';
import { truncateString } from 'src/utils/common.util';
import { isCurrentUser } from 'src/utils/message.util';

const ReplyingMessage = () => {
  const { currentReplyMessage, setCurrentReplyMessage } =
    useConversationStore();

  const isMessageSendByMe = isCurrentUser(
    currentReplyMessage?.sender?.profile.id
  );

  const messageType = currentReplyMessage?.type;
  const mediaType = currentReplyMessage?.mediaList?.[0]?.type || '';

  const renderReplyMessageContent = () => {
    if (
      messageType === EMessageType.TEXT ||
      messageType === EMessageType.ICON
    ) {
      return truncateString(currentReplyMessage!.content || '', 72);
    }
    if (messageType === EMessageType.MEDIA) {
      switch (mediaType) {
        case EMessageMediaType.PHOTO:
          return 'Image';
        case EMessageMediaType.VIDEO:
          return 'Video';
        case EMessageMediaType.AUDIO:
          return 'Audio';
        case EMessageMediaType.FILE:
          return 'Attachment';
      }
    }
  };

  return currentReplyMessage ? (
    <div className="flex items-center justify-between pt-[10px] px-[15px]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold leading-[20px]">
          Replying to{' '}
          {isMessageSendByMe
            ? 'yourself'
            : currentReplyMessage.sender?.profile.fullName}
        </span>
        <span className="text-[13px] text-muted-foreground leading-[16px]">
          {renderReplyMessageContent()}
        </span>
      </div>
      <div
        className="flex items-center justify-center size-5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full cursor-pointer"
        onClick={() => setCurrentReplyMessage(null)}
      >
        <XIcon className="size-2.5" />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default ReplyingMessage;
