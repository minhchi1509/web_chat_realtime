import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { FC, useEffect } from 'react';
import EmojiPicker, {
  EmojiClickData,
  Theme as EmojiPickerTheme
} from 'emoji-picker-react';

import { HappyIcon, PlusIcon } from 'src/assets/icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from 'src/components/ui/shadcn-ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import { dropMessageEmotion } from 'src/services/chat.service';
import { useConversationStore } from 'src/store/useConversationStore';
import { TErrorResponse } from 'src/types/error-response.type';
import { showErrorToast } from 'src/utils/toast.util';
import { useTheme } from 'next-themes';
import { useInView } from 'react-intersection-observer';
import { getEmojiDisplayUrl } from 'src/utils/message.util';

interface IMessageReactionPopoverProps {
  conversationId: string;
  messageId: string;
}

const QUICK_MESSAGE_REACT_EMOTIONS = [
  '2764',
  '1f606',
  '1f62e',
  '1f622',
  '1f621',
  '1f44d'
];

const MessageReactionPopover: FC<IMessageReactionPopoverProps> = ({
  conversationId,
  messageId
}) => {
  const { theme } = useTheme();
  const {
    currentMessageActions,
    closeMessageActionsPopover,
    openMessageActionsPopover
  } = useConversationStore();

  const { mutate: triggerDropEmotionMessage } = useMutation({
    mutationFn: async ({
      messageId,
      emojiCode
    }: {
      messageId: string;
      emojiCode: string;
    }) => {
      await dropMessageEmotion({ emojiCode }, { conversationId, messageId });
    },
    onError: (error: TErrorResponse) => {
      showErrorToast(error.message);
    }
  });

  const { ref: observerRef, inView } = useInView({
    threshold: 1
  });

  const handleOpenEmojiPicker = () => {
    openMessageActionsPopover(messageId, { openReactEmojiPicker: true });
  };

  const handleReactOnMessage = (emojiCode: string) => {
    closeMessageActionsPopover();
    triggerDropEmotionMessage({ messageId, emojiCode });
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    handleReactOnMessage(emojiData.unified);
  };

  useEffect(() => {
    if (!inView) {
      closeMessageActionsPopover();
    }
  }, [inView]);

  return (
    <Popover
      open={
        (currentMessageActions.openReactPopover ||
          currentMessageActions.openReactEmojiPicker) &&
        currentMessageActions.messageId === messageId
      }
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeMessageActionsPopover();
        } else {
          openMessageActionsPopover(messageId, { openReactPopover: true });
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger>
          <PopoverTrigger asChild>
            <div
              ref={observerRef}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <HappyIcon
                width={16}
                height={16}
                className="text-[#65686C] dark:text-[#B0B3B8]"
              />
            </div>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>React</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        side="top"
        className="size-fit p-0 rounded-full"
      >
        {currentMessageActions.openReactEmojiPicker && (
          <EmojiPicker
            theme={
              theme === 'dark' ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT
            }
            onEmojiClick={handleEmojiClick}
            skinTonesDisabled
            height={400}
          />
        )}
        {currentMessageActions.openReactPopover && (
          <div className="flex items-center gap-2 w-auto rounded-full px-4 py-2">
            {QUICK_MESSAGE_REACT_EMOTIONS.map((emojiCode) => (
              <Image
                key={emojiCode}
                width={32}
                height={32}
                alt="message-emotion"
                className="h-8 hover:scale-120 transition-transform duration-200 cursor-pointer"
                src={getEmojiDisplayUrl(emojiCode)}
                onClick={() => handleReactOnMessage(emojiCode)}
              />
            ))}
            <div
              className="size-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 duration-200"
              onClick={handleOpenEmojiPicker}
            >
              <PlusIcon
                className="text-[#65686C] dark:text-[#B0B3B8]"
                width={16}
                height={16}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MessageReactionPopover;
