import { create } from 'zustand';

import { TConversationStore } from 'src/types/store/conversation-store.type';

export const useConversationStore = create<TConversationStore>((set, get) => ({
  currentMessageActions: {
    messageId: '',
    openReactPopover: false,
    openReactEmojiPicker: false,
    openMoreActionsPopover: false,
    openUnsendModal: false
  },
  messageMediaViewSlider: {
    isOpen: false,
    initialIndex: 0,
    mediaList: []
  },

  openMessageActionsPopover: (messageId, actions) => {
    set(() => ({
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
  },

  openMessageMediaViewSlider: (mediaList, initialIndex = 0) => {
    set(() => ({
      messageMediaViewSlider: {
        isOpen: true,
        initialIndex,
        mediaList
      }
    }));
  },

  closeMessageMediaViewSlider: () =>
    set(() => ({
      messageMediaViewSlider: {
        isOpen: false,
        initialIndex: 0,
        mediaList: []
      }
    }))
}));
