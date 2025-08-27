/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import React, { FC } from 'react';
import ReplyingMessage from 'src/components/ui/features/chat/ReplyingMessage';
import SendMessageFilePreview from 'src/components/ui/features/chat/SendMessageFilePreview';

import { Button } from 'src/components/ui/shadcn-ui/button';
import { Textarea } from 'src/components/ui/shadcn-ui/textarea';
import UploadFileButton from 'src/components/ui/shared/UploadFileButton';
import {
  MAX_MESSAGE_FILE_PER_UPLOAD,
  MAX_MESSAGE_FILE_SIZE
} from 'src/constants/variables';
import { chatService } from 'src/services';
import { useConversationStore } from 'src/store/useConversationStore';
import { TUploadFile } from 'src/types/common.type';
import { TErrorResponse } from 'src/types/error-response.type';
import { cn, delay, scrollToBottom } from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';

interface IChatActionProps {
  conversationId: string;
  showElement: boolean;
  messageFiles: TUploadFile[];
  onChangeFiles: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  onRemoveAllFiles: () => void;
}

const ChatAction: FC<IChatActionProps> = ({
  messageFiles,
  onChangeFiles,
  onRemoveFile,
  onRemoveAllFiles,
  showElement = true,
  conversationId
}) => {
  const {
    currentReplyMessage,
    setCurrentReplyMessage,
    setActiveParentMessageId
  } = useConversationStore();
  const [message, setMessage] = React.useState<string>('');
  const textAreaMessageRef = React.useRef<HTMLTextAreaElement>(null);

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    onChangeFiles(Array.from(files));
    textAreaMessageRef.current?.focus();
  };

  const { isPending: isSendingMessage, mutate: sendConversationMessage } =
    useMutation({
      mutationFn: async () => {
        const formData = new FormData();
        message && formData.append('content', message);
        currentReplyMessage?.id &&
          formData.append('parentMessageId', currentReplyMessage.id);
        messageFiles.forEach((file) => {
          formData.append('messageFiles', file.originalFileObject);
        });
        await chatService.sendMessage(conversationId, formData);
      },
      onError: (error: TErrorResponse) => {
        showErrorToast(error.message);
      },
      onSuccess: async () => {
        setMessage('');
        onRemoveAllFiles();
        setCurrentReplyMessage(null);
        setActiveParentMessageId(null);
        await delay(0.1);
        scrollToBottom(document.getElementById('message-infinite-scroller')!);
      }
    });

  return (
    <div className="flex flex-col border-t border-muted overflow-hidden">
      <ReplyingMessage />
      <div className={cn('flex p-2 overflow-hidden', !showElement && 'hidden')}>
        <UploadFileButton
          className="mr-2 shrink-0 self-end"
          onFileChange={handleChangeFile}
          variant="ghost"
          maxFileSize={MAX_MESSAGE_FILE_SIZE}
          maxFiles={MAX_MESSAGE_FILE_PER_UPLOAD}
          uploadedFilesLength={messageFiles.length}
        />
        <div className="flex-1 overflow-hidden bg-[#F0F2F5] dark:bg-zinc-800 rounded-xl px-3 py-2">
          <div className="flex flex-col">
            {messageFiles.length > 0 && (
              <SendMessageFilePreview
                messageFiles={messageFiles}
                onRemoveFile={onRemoveFile}
              />
            )}
          </div>
          <div className="flex">
            <Textarea
              ref={textAreaMessageRef}
              className="flex-1 focus-visible:ring-transparent max-h-[200px] resize-none min-h-[20px] border-none shadow-none bg-transparent dark:bg-transparent p-0 rounded-none"
              placeholder="Type your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // chặn xuống dòng
                  sendConversationMessage(); // gửi tin nhắn
                }
              }}
            />
          </div>
        </div>
        <Button
          className="ml-2 self-end"
          variant="ghost"
          size="icon"
          disabled={!message && !messageFiles.length}
          isLoading={isSendingMessage}
          onClick={() => sendConversationMessage()}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatAction;
