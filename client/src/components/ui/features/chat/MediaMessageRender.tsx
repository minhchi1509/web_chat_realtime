/* eslint-disable @next/next/no-img-element */
import { FileText, Play } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { useConversationStore } from 'src/store/useConversationStore';

import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { EMessageMediaType } from 'src/types/api/model.type';
import { cn, downloadFileFromUrl } from 'src/utils/common.util';

interface IMediaMessageRenderProps {
  isMessageSendByMe: boolean;
  message: TConversationMessageResponse;
}

const MediaMessageRender: React.FC<IMediaMessageRenderProps> = ({
  message,
  isMessageSendByMe
}) => {
  const { openMessageMediaViewSlider, activeParentMessageId } =
    useConversationStore();
  const senderDisplayName = isMessageSendByMe
    ? 'You'
    : message.sender?.profile.fullName;
  const mediaType = message.mediaList?.[0]?.type;

  const handleOpenMediaSlider = (idx: number) => {
    openMessageMediaViewSlider(
      message.mediaList.map((m) => ({ ...m })),
      idx
    );
  };

  const isMessageActive = activeParentMessageId === message.id;

  if (mediaType === EMessageMediaType.PHOTO) {
    return (
      <div
        id={`message-${message.id}`}
        className={cn(
          'flex flex-col overflow-hidden rounded-[inherit]',
          isMessageSendByMe ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn('flex flex-col max-w-[384px]', {
            'items-end': isMessageSendByMe
          })}
        >
          {!message.replyToMessage && (
            <span className="mb-1 mt-2 text-xs text-[rgb(101,104,108)] dark:text-[rgb(176,179,184)]">{`${senderDisplayName} sent ${message.mediaList.length} photo${message.mediaList.length > 1 ? 's' : ''}`}</span>
          )}
          <div
            className={cn('relative flex flex-wrap gap-1', {
              'border-2 border-white': isMessageActive
            })}
          >
            {message.mediaList.map((mediaItem, idx) => (
              <img
                key={idx}
                src={mediaItem.url}
                alt={'Message media'}
                className="aspect-square max-h-[296px] min-w-[125px] flex-1 cursor-pointer rounded-[18px] object-cover hover:opacity-80"
                onClick={() => handleOpenMediaSlider(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mediaType === EMessageMediaType.VIDEO) {
    return (
      <div
        id={`message-${message.id}`}
        className="relative size-fit cursor-pointer"
        onClick={() => handleOpenMediaSlider(0)}
      >
        <Image
          width={125}
          height={125}
          src={message.mediaList[0].url.replaceAll('.mp4', '.jpg')}
          alt="media"
          className={cn('aspect-square rounded-lg object-cover', {
            'border-2 border-white': isMessageActive
          })}
        />
        <div className="absolute inset-0 m-auto size-fit rounded-full bg-black/50 p-3">
          <Play className="text-white" size={20} fill="white" />
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'w-fit max-w-[564px] cursor-pointer overflow-hidden rounded-[inherit]',
        {
          'border-2 border-white': isMessageActive
        }
      )}
      onClick={() =>
        downloadFileFromUrl(
          message.mediaList[0].url,
          message.mediaList[0].fileName || 'file'
        )
      }
    >
      <div className="flex min-h-[54px] items-center gap-2 overflow-hidden bg-[#F0F0F0] px-3 py-2 dark:bg-[#303030]">
        <div className="flex size-8 items-center justify-center rounded-full bg-[#E4E4E4] dark:bg-[#2E2E2E]">
          <FileText
            className="text-[rgb(101,104,108)] dark:text-[rgb(176,179,184)]"
            size={16}
          />
        </div>
        <span className="break-all text-[15px] font-semibold text-[#080809] dark:text-white">
          {message.mediaList[0].fileName}
        </span>
      </div>
    </div>
  );
};

export default MediaMessageRender;
