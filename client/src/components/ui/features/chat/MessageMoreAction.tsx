import React, { FC, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ThreeDotVertical } from 'src/assets/icons';
import UnsendMessageDialog from 'src/components/ui/features/chat/UnsendMessageDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from 'src/components/ui/shadcn-ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import { useConversationStore } from 'src/store/useConversationStore';

interface IMessageMoreActionProps {
  conversationId: string;
  messageId: string;
  isMessageSendByMe: boolean;
  canMessageRevoked: boolean;
}

const MessageMoreAction: FC<IMessageMoreActionProps> = ({
  conversationId,
  messageId,
  isMessageSendByMe,
  canMessageRevoked
}) => {
  const {
    currentMessageActions,
    closeMessageActionsPopover,
    openMessageActionsPopover
  } = useConversationStore();

  const { ref: observerRef, inView } = useInView({
    threshold: 1
  });

  const handleOpenUnsendMessageDialog = () => {
    openMessageActionsPopover(messageId, { openUnsendModal: true });
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeMessageActionsPopover();
    } else {
      openMessageActionsPopover(messageId, {
        openMoreActionsPopover: true
      });
    }
  };

  useEffect(() => {
    if (!inView) {
      closeMessageActionsPopover();
    }
  }, [inView]);

  return (
    <>
      <DropdownMenu
        open={
          currentMessageActions.openMoreActionsPopover &&
          currentMessageActions.messageId === messageId
        }
        onOpenChange={handleDialogOpenChange}
      >
        <Tooltip>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild>
              <div
                ref={observerRef}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ThreeDotVertical
                  width={16}
                  height={16}
                  className="text-[#65686C] dark:text-[#B0B3B8]"
                />
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>More</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="top" align="center">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleOpenUnsendMessageDialog}
          >
            {isMessageSendByMe ? 'Unsend' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {currentMessageActions.messageId === messageId && (
        <UnsendMessageDialog
          conversationId={conversationId}
          messageId={messageId}
          isMessageSendByMe={isMessageSendByMe}
          canMessageRevoked={canMessageRevoked}
        />
      )}
    </>
  );
};

export default MessageMoreAction;
