import { useMutation } from '@tanstack/react-query';
import React, { FC, useEffect } from 'react';
import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from 'src/components/ui/shadcn-ui/dialog';
import { Label } from 'src/components/ui/shadcn-ui/label';
import {
  RadioGroup,
  RadioGroupItem
} from 'src/components/ui/shadcn-ui/radio-group';
import { chatService } from 'src/services';
import { useConversationStore } from 'src/store/useConversationStore';
import { TErrorData } from 'src/types/error-response.type';
import { cn } from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';

interface IUnsendMessageDialogProps {
  conversationId: string;
  messageId: string;
  isMessageSendByMe: boolean;
  canMessageRevoked: boolean;
}

const UnsendMessageDialog: FC<IUnsendMessageDialogProps> = ({
  conversationId,
  messageId,
  isMessageSendByMe,
  canMessageRevoked
}) => {
  const [unsendType, setUnsendType] = React.useState<'for_me' | 'for_everyone'>(
    'for_everyone'
  );
  const {
    currentMessageActions,
    closeMessageActionsPopover,
    openMessageActionsPopover
  } = useConversationStore();

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeMessageActionsPopover();
    } else {
      openMessageActionsPopover(messageId, { openUnsendModal: true });
    }
  };

  const isCanOnlyDeleteMessage = !isMessageSendByMe || !canMessageRevoked;

  const { isPending: isUnsendMessage, mutate: unsendMessage } = useMutation({
    mutationFn: async () => {
      if (isCanOnlyDeleteMessage || unsendType === 'for_me') {
        await chatService.deleteMessage(conversationId, messageId);
      } else {
        await chatService.revokeMessage(conversationId, messageId);
      }
    },
    onError: (error: TErrorData) => {
      showErrorToast(error.message);
    },
    onSuccess: () => {
      closeMessageActionsPopover();
    }
  });

  return (
    <Dialog
      open={currentMessageActions.openUnsendModal}
      onOpenChange={handleDialogOpenChange}
    >
      <DialogContent
        className={cn(
          isCanOnlyDeleteMessage ? 'sm:max-w-[548px]' : 'sm:max-w-[700px]'
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {isCanOnlyDeleteMessage
              ? 'Remove for you'
              : 'Who do you want to unsend this message for?'}
          </DialogTitle>
        </DialogHeader>
        <div>
          {isCanOnlyDeleteMessage ? (
            <div className="text-[15px]">
              This will remove the message from your devices. Other chat members
              will still be able to see it.
            </div>
          ) : (
            <RadioGroup
              onValueChange={(v) =>
                setUnsendType(v as 'for_me' | 'for_everyone')
              }
              value={unsendType}
            >
              <div className="flex flex-col gap-7">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="for_everyone"
                      id="for_everyone"
                      className="size-6 border-zinc-400 dark:border-zinc-500 cursor-pointer"
                    />
                    <Label
                      htmlFor="for_everyone"
                      className="text-[15px] font-semibold cursor-pointer"
                    >
                      Unsend for everyone
                    </Label>
                  </div>
                  <div className="ml-8">
                    <span className="text-[15px] text-muted-foreground">
                      This message will be unsent for everyone in the chat.
                      Others may have already seen or forwarded it. Unsent
                      messages can still be included in reports.
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="for_me"
                      id="for_me"
                      className="size-6 border-zinc-400 dark:border-zinc-500 cursor-pointer"
                    />
                    <Label
                      htmlFor="for_me"
                      className="text-[15px] font-semibold cursor-pointer"
                    >
                      Unsend for you
                    </Label>
                  </div>
                  <div className="ml-8">
                    <span className="text-[15px] text-muted-foreground">
                      This will remove the message from your devices. Other chat
                      members will still be able to see it.
                    </span>
                  </div>
                </div>
              </div>
            </RadioGroup>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="cursor-pointer"
            isLoading={isUnsendMessage}
            onClick={() => unsendMessage()}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsendMessageDialog;
