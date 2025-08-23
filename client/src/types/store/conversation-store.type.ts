import { IMediaItem } from 'src/components/ui/shared/FullScreenMediaSlider';

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
};
