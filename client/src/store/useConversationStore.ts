import { create } from 'zustand';

import { TUserResponse } from 'src/types/api/model.type';

type TCurrentMessageActions = {
  messageId: string;
  openReactPopover: boolean;
  openReactEmojiPicker: boolean;
  openMoreActionsPopover: boolean;
  openUnsendModal: boolean;
};

type TConversationStore = {
  currentMessageActions: TCurrentMessageActions;
  openMessageActionsPopover: (
    messageId: string,
    actions: Partial<Omit<TCurrentMessageActions, 'messageId'>>
  ) => void;
  closeMessageActionsPopover: () => void;
};

export const useConversationStore = create<TConversationStore>((set, get) => ({
  currentMessageActions: {
    messageId: '',
    openReactPopover: false,
    openReactEmojiPicker: false,
    openMoreActionsPopover: false,
    openUnsendModal: false
  },

  openMessageActionsPopover: (messageId, actions) => {
    set((state) => ({
      currentMessageActions: {
        openReactPopover: false,
        openReactEmojiPicker: false,
        openMoreActionsPopover: false,
        openUnsendModal: false,
        messageId,
        ...actions
      }
    }));
  },

  // Close the message actions popover
  closeMessageActionsPopover: () => {
    set(() => ({
      currentMessageActions: {
        openReactPopover: false,
        openReactEmojiPicker: false,
        openMoreActionsPopover: false,
        openUnsendModal: false,
        messageId: ''
      }
    }));
  }
}));
