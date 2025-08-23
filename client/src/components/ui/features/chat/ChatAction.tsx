/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { useMutation } from '@tanstack/react-query';
import { FileText, Play, Send, XIcon } from 'lucide-react';
import Image from 'next/image';
import React, { FC } from 'react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import { ScrollArea, ScrollBar } from 'src/components/ui/shadcn-ui/scroll-area';
import { Textarea } from 'src/components/ui/shadcn-ui/textarea';
import UploadFileButton from 'src/components/ui/shared/UploadFileButton';
import {
  MAX_MESSAGE_FILE_PER_UPLOAD,
  MAX_MESSAGE_FILE_SIZE
} from 'src/constants/variables';
import { chatService } from 'src/services';
import { TUploadFile } from 'src/types/common.type';
import { TErrorResponse } from 'src/types/error-response.type';
import { cn } from 'src/utils/common.util';
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
        messageFiles.forEach((file) => {
          formData.append('messageFiles', file.originalFileObject);
        });
        await chatService.sendMessage(conversationId, formData);
      },
      onError: (error: TErrorResponse) => {
        showErrorToast(error.message);
      },
      onSuccess: () => {
        setMessage('');
        onRemoveAllFiles();
      }
    });

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex p-2 border-t border-muted overflow-hidden',
          !showElement && 'hidden'
        )}
      >
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
              <ScrollArea className="pb-2">
                <div className="flex gap-4">
                  {messageFiles.map((file, index) => {
                    const isVideoFile =
                      file.originalFileObject.type.includes('video/');
                    const isImageFile =
                      file.originalFileObject.type.includes('image/');
                    return (
                      <div key={index} className="relative shrink-0 mt-2">
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
                            <Play
                              className="text-white"
                              size={12}
                              fill="white"
                            />
                          </div>
                        )}
                        {!isVideoFile && !isImageFile && (
                          <div className="flex items-center justify-center gap-2 rounded-lg bg-[#C9CCD1] dark:bg-black p-3">
                            <FileText size={20} />
                            <span className="text-xs">
                              {file.originalFileObject.name}
                            </span>
                          </div>
                        )}
                        <div
                          className="absolute -right-2 -top-2 size-fit rounded-full bg-white dark:bg-zinc-700 p-1 duration-200 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => onRemoveFile(file.id)}
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
          </div>
          <div className="flex">
            <Textarea
              ref={textAreaMessageRef}
              className="flex-1 focus-visible:ring-transparent max-h-[200px] resize-none min-h-[20px] border-none shadow-none bg-transparent dark:bg-transparent p-0 rounded-none"
              placeholder="Type your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter') {
              //     e.preventDefault();
              //     sendConversationMessage();
              //   }
              // }}
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
