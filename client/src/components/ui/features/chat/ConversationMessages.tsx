/* eslint-disable react-hooks/exhaustive-deps */

'use client';
import { FC, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

import { UploadIcon } from 'src/assets/icons';
import ChatAction from 'src/components/ui/features/chat/ChatAction';
import ChatAvatarStatus from 'src/components/ui/features/chat/ChatAvatarStatus';
import ConsecutiveMessages from 'src/components/ui/features/chat/ConsecutiveMessages';
import FullScreenMediaSlider from 'src/components/ui/shared/FullScreenMediaSlider';
import InfiniteScroller from 'src/components/ui/shared/infinite-scrollers';
import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import {
  MAX_MESSAGE_FILE_PER_UPLOAD,
  MAX_MESSAGE_FILE_SIZE
} from 'src/constants/variables';
import useGetConversationDetails from 'src/hooks/cache/useGetConversationDetails';
import { useGetConversationMessages } from 'src/hooks/cache/useGetConversationMessages';
import { useSocketStore } from 'src/store/useSocketStore';
import { TUploadFile } from 'src/types/common.type';
import { getVideoPoster } from 'src/utils/common.util';
import { formatToConsecutive } from 'src/utils/message.util';
import { showErrorToast } from 'src/utils/toast.util';
import { validateUploadFiles } from 'src/utils/validations/file-validation';
import { useConversationStore } from 'src/store/useConversationStore';

interface IConversationMessagesProps {
  conversationId: string;
}

const ConversationMessages: FC<IConversationMessagesProps> = ({
  conversationId
}) => {
  const { messageMediaViewSlider, closeMessageMediaViewSlider } =
    useConversationStore();
  const [sendMessageFiles, setSendMessageFiles] = useState<TUploadFile[]>([]);

  const chatSocket = useSocketStore((state) => state.getSocket('/chat'));
  const {
    data: conversationDetails,
    isLoading: isGettingConversationDetails,
    error: getConversationDetailsError
  } = useGetConversationDetails(conversationId);

  const {
    data: conversationMessages,
    isLoading: isGettingConversationMessages,
    fetchNextPage: fetchNextPageMessages,
    hasNextPage: hasMoreMessages
  } = useGetConversationMessages(conversationId, {});

  const handleChangeMessageFiles = async (files: File[]) => {
    const { isValid, errorMessage } = validateUploadFiles(
      files,
      sendMessageFiles.length,
      {
        maxFiles: MAX_MESSAGE_FILE_PER_UPLOAD,
        maxFileSize: MAX_MESSAGE_FILE_SIZE
      }
    );
    if (!isValid) {
      showErrorToast(errorMessage);
      return;
    }
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
    setSendMessageFiles([...sendMessageFiles, ...newFiles]);
  };

  const handleRemoveMessageFile = (id: string) => {
    const removeMessageFile = sendMessageFiles.find((file) => file.id === id);
    if (removeMessageFile) {
      URL.revokeObjectURL(removeMessageFile.previewUrl);
      setSendMessageFiles(sendMessageFiles.filter((file) => file.id !== id));
    }
  };

  const handleMarkMessageSeen = () => {
    chatSocket.emit('user_mark_seen_message', { conversationId });
  };

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: async (files: File[]) => {
      await handleChangeMessageFiles(files);
    }
  });

  const consecutiveMessages = conversationMessages
    ? formatToConsecutive(
        conversationMessages.pages.flatMap((page) => page.data)
      )
    : [];

  const handleMediaSliderOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeMessageMediaViewSlider();
    }
  };

  useEffect(() => {
    handleMarkMessageSeen();
  }, [conversationId]);

  return (
    <div className="relative flex h-full flex-col">
      {(isGettingConversationDetails || isGettingConversationMessages) && (
        <LoadingSpinner className="center-xy" />
      )}
      {getConversationDetailsError &&
        !isGettingConversationDetails &&
        !isGettingConversationMessages &&
        (getConversationDetailsError as any).data.statusCode === 404 && (
          <div className="center-xy size-fit">
            <p className="text-2xl font-medium text-muted-foreground">
              Conversation not found
            </p>
          </div>
        )}
      {conversationDetails && (
        <div className="flex items-center border-b border-muted p-2 pl-4 shadow-sm">
          <div className="flex items-center">
            <ChatAvatarStatus
              className="mr-3"
              src={conversationDetails.thumbnail}
              size={60}
              isOnline={conversationDetails.isOnline}
            />
            <div className="flex flex-col">
              <p className="text-lg font-medium">{conversationDetails.name}</p>
              {conversationDetails.isOnline && (
                <p className="text-xs text-muted-foreground">Active now</p>
              )}
            </div>
          </div>
        </div>
      )}
      {conversationMessages && (
        <div
          {...getRootProps({
            className: 'relative z-[5] flex flex-1 flex-col overflow-hidden'
          })}
        >
          {isDragActive && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-800 bg-[#EFF6FE]/95 bg-clip-border dark:border-blue-500 dark:bg-[#010F29]/95">
              <div className="flex flex-col items-center text-black dark:text-white">
                <UploadIcon className="size-16" />
                <p>Drop file here</p>
                <p>Max files: {MAX_MESSAGE_FILE_PER_UPLOAD}</p>
                <p>Max file size: {MAX_MESSAGE_FILE_SIZE / 1024 / 1024}MB</p>
              </div>
            </div>
          )}

          <InfiniteScroller
            id="message-infinite-scroller"
            fetchNextPage={fetchNextPageMessages}
            hasNextPage={hasMoreMessages}
            className="flex flex-1 flex-col-reverse gap-2 overflow-auto pb-2 pl-4 pr-2 pt-4"
          >
            {consecutiveMessages.toReversed().map((messages, idx) => (
              <ConsecutiveMessages key={idx} messages={messages} />
            ))}
          </InfiniteScroller>

          <ChatAction
            messageFiles={sendMessageFiles}
            onChangeFiles={handleChangeMessageFiles}
            onRemoveFile={handleRemoveMessageFile}
            onRemoveAllFiles={() => setSendMessageFiles([])}
            showElement={
              !isGettingConversationDetails && !isGettingConversationMessages
            }
            conversationId={conversationId}
          />
        </div>
      )}
      {messageMediaViewSlider.isOpen && (
        <FullScreenMediaSlider
          onOpenChange={handleMediaSliderOpenChange}
          mediaList={messageMediaViewSlider.mediaList}
          initialIndex={messageMediaViewSlider.initialIndex}
        />
      )}
    </div>
  );
};

export default ConversationMessages;
