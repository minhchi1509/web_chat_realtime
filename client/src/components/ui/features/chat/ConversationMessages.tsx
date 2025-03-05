/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable tailwindcss/migration-from-tailwind-2 */
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FileText, Play } from 'lucide-react';
import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

import { UploadIcon } from 'src/assets/icons';
import ChatAction from 'src/components/ui/features/chat/ChatAction';
import ChatAvatarStatus from 'src/components/ui/features/chat/ChatAvatarStatus';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import FullScreenMediaSlider, {
  IMediaItem
} from 'src/components/ui/shared/FullScreenMediaSlider';
import InfiniteScroller from 'src/components/ui/shared/infinite-scrollers';
import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import {
  MAX_MESSAGE_FILE_PER_UPLOAD,
  MAX_MESSAGE_FILE_SIZE
} from 'src/constants/variables';
import useGetConversationDetails from 'src/hooks/cache/useGetConversationDetails';
import { useGetConversationMessages } from 'src/hooks/cache/useGetConversationMessages';
import useSessionUser from 'src/hooks/useSessionUser';
import { useSocketStore } from 'src/hooks/zustand/useSocketStore';
import { TUploadFile } from 'src/types/common.type';
import {
  cn,
  downloadFileFromUrl,
  formatMessageTimeLine,
  getVideoPoster
} from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';
import { validateUploadFiles } from 'src/utils/validations/file-validation';

interface IConversationMessagesProps {
  conversationId: string;
}

const ConversationMessages: FC<IConversationMessagesProps> = ({
  conversationId
}) => {
  const [sendMessageFiles, setSendMessageFiles] = useState<TUploadFile[]>([]);
  const [viewMediaList, setViewMediaList] = useState<IMediaItem[]>([]);
  const [openMediaSlider, setOpenMediaSlider] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const chatSocket = useSocketStore((state) => state.getSocket('/chat'));
  const queryClient = useQueryClient();
  const currentUser = useSessionUser();
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

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: async (files: File[]) => {
      await handleChangeMessageFiles(files);
    }
  });

  useEffect(() => {
    chatSocket.on('new_seen_message', async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
        queryClient.invalidateQueries({
          queryKey: ['conversation-messages', { conversationId }]
        })
      ]);
    });

    return () => {
      chatSocket.off('new_seen_message');
    };
  }, [conversationId]);

  useEffect(() => {
    chatSocket.emit('user_mark_seen_message', { conversationId });
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
        <div className="flex items-center border-b border-muted p-2 pl-4">
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
            className: 'relative z-[5] flex flex-1 flex-col overflow-auto'
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
            fetchNextPage={fetchNextPageMessages}
            hasNextPage={hasMoreMessages}
            className="flex flex-1 flex-col-reverse gap-2 overflow-auto p-4 pb-2"
          >
            {conversationMessages.pages.map((page) =>
              page.data.map((message, i) => {
                const isMessageSentByMe =
                  message.sender.profile.id === currentUser.id;
                const isPreviousMessageSentBySameUser =
                  page.data[i - 1]?.sender.id === message.sender.id;
                const isPreviousMessageShowSeperateTime =
                  page.data[i - 1]?.isShowSeperateTime;
                const photoAndVideoMediaList = message.mediaList.filter(
                  (media) => media.type !== 'AUDIO' && media.type !== 'FILE'
                );
                const fileMediaList = message.mediaList.filter(
                  (media) => media.type === 'FILE'
                );
                const audioMediaList = message.mediaList.filter(
                  (media) => media.type === 'AUDIO'
                );

                return (
                  <div key={message.id} className="flex flex-col">
                    {message.isShowSeperateTime && (
                      <div className="justify-center">
                        <div className="mx-auto my-2 size-fit">
                          <p className="text-center text-xs text-muted-foreground">
                            {formatMessageTimeLine(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div
                      className={cn(
                        'flex relative',
                        isMessageSentByMe ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className="flex max-w-[80%]">
                        {!isMessageSentByMe && (
                          <div className="flex w-10 items-end">
                            {(!isPreviousMessageSentBySameUser ||
                              message.isShowSeperateTime ||
                              isPreviousMessageShowSeperateTime) && (
                              <ChatAvatarStatus
                                src={message.sender.profile.avatar}
                                size={40}
                                className="mr-2 justify-end"
                              />
                            )}
                          </div>
                        )}
                        <div className="flex flex-col">
                          {message.content && (
                            <div
                              className={cn(
                                'w-fit rounded-3xl px-3 py-2',
                                isMessageSentByMe
                                  ? 'bg-blue-500 dark:bg-blue-600 text-white ml-auto'
                                  : 'bg-muted'
                              )}
                            >
                              <p className="text-[15px]">{message.content}</p>
                            </div>
                          )}
                          {photoAndVideoMediaList.length > 0 && (
                            <div
                              className={cn(
                                'mt-1 grid grid-cols-1 gap-1',
                                photoAndVideoMediaList.length >= 3 &&
                                  'grid-cols-3',
                                photoAndVideoMediaList.length === 2 &&
                                  'grid-cols-2'
                              )}
                            >
                              {photoAndVideoMediaList.map((media, i) => (
                                <div
                                  className="relative shrink-0 hover:cursor-pointer"
                                  key={media.id}
                                  onClick={() => {
                                    setViewMediaList(photoAndVideoMediaList);
                                    setActiveMediaIndex(i);
                                    setOpenMediaSlider(true);
                                  }}
                                >
                                  <Image
                                    width={128}
                                    height={128}
                                    src={media.url.replaceAll('.mp4', '.jpg')}
                                    alt="media"
                                    className="aspect-square rounded-lg object-cover"
                                  />
                                  {media.type === 'VIDEO' && (
                                    <div className="absolute inset-0 m-auto size-fit rounded-full bg-black bg-opacity-50 p-3">
                                      <Play
                                        className="text-white"
                                        size={20}
                                        fill="white"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {fileMediaList.length > 0 && (
                            <div
                              className={cn(
                                'mt-1 flex flex-col gap-1',
                                isMessageSentByMe ? 'items-end' : 'items-start'
                              )}
                            >
                              {fileMediaList.map((media) => (
                                <button
                                  key={media.id}
                                  className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3"
                                  onClick={() =>
                                    downloadFileFromUrl(
                                      media.url,
                                      media.fileName || ''
                                    )
                                  }
                                >
                                  <FileText size={20} />
                                  <span className="text-xs">
                                    {media.fileName}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                          {isMessageSentByMe && message.seenBy.length > 0 && (
                            <div className="ml-auto mt-2 flex gap-2">
                              {message.seenBy.map((seenParticipant) => (
                                <TooltipProvider key={seenParticipant.id}>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ChatAvatarStatus
                                        key={seenParticipant.id}
                                        src={seenParticipant.profile.avatar}
                                        size={15}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="z-10">
                                      <p>
                                        Seen at{' '}
                                        {formatMessageTimeLine(
                                          seenParticipant.seenAt
                                        )}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
      {openMediaSlider && (
        <FullScreenMediaSlider
          onOpenChange={setOpenMediaSlider}
          mediaList={viewMediaList}
          initialIndex={activeMediaIndex}
        />
      )}
    </div>
  );
};

export default ConversationMessages;
