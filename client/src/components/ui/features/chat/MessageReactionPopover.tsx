import { useMutation } from '@tanstack/react-query';
import React, { FC } from 'react';

import { ReactionIcon } from 'src/assets/icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from 'src/components/ui/shadcn-ui/popover';
import EmotionReact from 'src/components/ui/shared/EmotionReact';
import { EMessageEmotionType } from 'src/constants/enum';
import { dropMessageEmotion } from 'src/services/chat.service';
import { TErrorResponse } from 'src/types/error-response.type';
import { cn } from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';

interface IMessageReactionPopoverProps {
  conversationId: string;
  messageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDropEmotionSuccess?: () => void | Promise<void>;
  className?: string;
}

const MESSAGE_EMOTIONS_LIST = [
  EMessageEmotionType.LOVE,
  EMessageEmotionType.HAHA,
  EMessageEmotionType.WOW,
  EMessageEmotionType.SAD,
  EMessageEmotionType.ANGRY,
  EMessageEmotionType.LIKE
];

const MessageReactionPopover: FC<IMessageReactionPopoverProps> = ({
  conversationId,
  messageId,
  open,
  onOpenChange,
  onDropEmotionSuccess,
  className
}) => {
  const { mutate: triggerDropEmotionMessage } = useMutation({
    mutationFn: async ({
      messageId,
      emotionType
    }: {
      messageId: string;
      emotionType: EMessageEmotionType;
    }) => {
      await dropMessageEmotion({ emotionType }, { conversationId, messageId });
    },
    onSuccess: async () => {
      await onDropEmotionSuccess?.();
    },
    onError: (error: TErrorResponse) => {
      showErrorToast(error.message);
    }
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'rounded-full p-1.5 hover:bg-muted self-center',
            className
          )}
        >
          <ReactionIcon
            width={16}
            height={16}
            className="text-muted-foreground"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto gap-1 rounded-full px-3 py-2"
        align="center"
        side="right"
      >
        {MESSAGE_EMOTIONS_LIST.map((emotionType) => (
          <EmotionReact
            key={emotionType}
            type={emotionType}
            className="cursor-pointer transition-transform hover:scale-125"
            onClick={() =>
              triggerDropEmotionMessage({
                messageId: messageId,
                emotionType
              })
            }
          />
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default MessageReactionPopover;
