/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { useMutation } from '@tanstack/react-query';
import { FileText, Play, Send, XIcon } from 'lucide-react';
import Image from 'next/image';
import React, { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { sendMessage } from 'src/actions/chat.actions';
import { Button } from 'src/components/ui/shadcn-ui/button';
import { Input } from 'src/components/ui/shadcn-ui/input';
import { ScrollArea, ScrollBar } from 'src/components/ui/shadcn-ui/scroll-area';
import UploadFileButton from 'src/components/ui/shared/UploadFileButton';
import {
  MAX_MESSAGE_FILE_PER_UPLOAD,
  MAX_MESSAGE_FILE_SIZE
} from 'src/constants/variables';
import { TUploadFile } from 'src/types/common.type';
import { TErrorResponse } from 'src/types/error-response.type';
import { cn, executeServerAction, getVideoPoster } from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';

interface IChatActionProps {
  conversationId: string;
  showElement: boolean;
}

const ChatAction: FC<IChatActionProps> = ({
  showElement = true,
  conversationId
}) => {
  const [message, setMessage] = React.useState<string>('');
  const [messageFiles, setMessageFiles] = React.useState<TUploadFile[]>([]);
  const inputMessageRef = React.useRef<HTMLInputElement>(null);

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const isVideoFile = file.type.includes('video/');
        const isImageFile = file.type.includes('image/');
        return {
          id: uuidv4(),
          originalFileObject: file,
          previewUrl: isImageFile
            ? URL.createObjectURL(file)
            : isVideoFile
              ? await getVideoPoster(file, 0.5)
              : ''
        };
      })
    );
    setMessageFiles([...messageFiles, ...newFiles]);
    inputMessageRef.current?.focus();
  };

  const handleRemoveFile = (id: string) => {
    const removeMessageFile = messageFiles.find((file) => file.id === id);
    removeMessageFile && URL.revokeObjectURL(removeMessageFile.previewUrl);
    setMessageFiles(messageFiles.filter((file) => file.id !== id));
  };

  const { isPending: isSendingMessage, mutate: sendConversationMessage } =
    useMutation({
      mutationFn: async () => {
        const formData = new FormData();
        message && formData.append('content', message);
        messageFiles.forEach((file) => {
          formData.append('messageFiles', file.originalFileObject);
        });
        await executeServerAction(() => sendMessage(conversationId, formData));
      },
      onError: (error: TErrorResponse) => {
        showErrorToast(error.message);
      },
      onSuccess: () => {
        setMessage('');
        setMessageFiles([]);
      }
    });

  return (
    <div
      className={cn(
        'flex flex-col p-2 border-t border-muted',
        !showElement && 'hidden'
      )}
      id="message-action-container"
    >
      {messageFiles.length > 0 && (
        <ScrollArea className="max-w-4xl" scrollViewPortClassName="py-2">
          <div className="flex gap-4">
            {messageFiles.map((file, index) => {
              const isVideoFile =
                file.originalFileObject.type.includes('video/');
              const isImageFile =
                file.originalFileObject.type.includes('image/');
              return (
                <div key={index} className="relative shrink-0">
                  {(isVideoFile || isImageFile) && (
                    <Image
                      src={file.previewUrl}
                      alt="preview-file"
                      width={48}
                      height={48}
                      className="aspect-square rounded-lg object-cover"
                    />
                  )}
                  {isVideoFile && (
                    <div className="absolute inset-0 m-auto size-fit rounded-full bg-black bg-opacity-50 p-1">
                      <Play className="text-white" size={12} fill="white" />
                    </div>
                  )}
                  {!isVideoFile && !isImageFile && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3">
                      <FileText size={20} />
                      <span className="text-xs">
                        {file.originalFileObject.name}
                      </span>
                    </div>
                  )}
                  <div
                    className="absolute -right-2 -top-2 size-fit rounded-full bg-muted p-1 duration-200 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <XIcon size={12} />
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <div className="flex">
        <UploadFileButton
          className="mr-2"
          onFileChange={handleChangeFile}
          variant="ghost"
          maxFileSize={MAX_MESSAGE_FILE_SIZE}
          maxFiles={MAX_MESSAGE_FILE_PER_UPLOAD}
          uploadedFilesLength={messageFiles.length}
        />
        <input type="file" style={{ display: 'none' }} />
        <Input
          className="flex-1 focus-visible:ring-transparent"
          placeholder="Type your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          ref={inputMessageRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendConversationMessage();
            }
          }}
        />
        <Button
          className="ml-2"
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
