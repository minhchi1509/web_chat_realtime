import { IMediaItem } from 'src/components/ui/shared/FullScreenMediaSlider';
import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';

export type TCurrentMessageActions = {
  messageId: string;
  openReactPopover: boolean;
  openReactEmojiPicker: boolean;
  openMoreActionsPopover: boolean;
  openUnsendModal: boolean;
};

export type TMessageMediaViewSlider = {
  isOpen: boolean;
  initialIndex: number;
  mediaList: IMediaItem[];
};

export type TConversationStore = {
  currentMessageActions: TCurrentMessageActions;
  messageMediaViewSlider: TMessageMediaViewSlider;
  currentReplyMessage: TConversationMessageResponse | null;

  openMessageActionsPopover: (
    messageId: string,
    actions: Partial<Omit<TCurrentMessageActions, 'messageId'>>
  ) => void;
  closeMessageActionsPopover: () => void;
  openMessageMediaViewSlider: (
    mediaList: IMediaItem[],
    currentIndex?: number
  ) => void;
  closeMessageMediaViewSlider: () => void;
  setCurrentReplyMessage: (
    message: TConversationMessageResponse | null
  ) => void;
};
