import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { URL_REGEX } from 'src/constants/variables';
import { useConversationStore } from 'src/store/useConversationStore';
import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { EMessageType } from 'src/types/api/model.type';
import { cn } from 'src/utils/common.util';

interface ITextMessageRenderProps {
  isMessageSendByMe: boolean;
  message: TConversationMessageResponse;
}

const renderWithDetectUrl = (content: string) => {
  if (!content) return null;

  // Reset the regex lastIndex to ensure it starts from the beginning
  URL_REGEX.lastIndex = 0;

  let lastIndex = 0;
  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;

  // Find all URLs in the content
  while ((match = URL_REGEX.exec(content)) !== null) {
    const url = match[0];
    const matchIndex = match.index;

    // Add text before the URL
    if (matchIndex > lastIndex) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {content.slice(lastIndex, matchIndex)}
        </span>
      );
    }

    // Add the URL with styling
    elements.push(
      <Link
        key={`link-${matchIndex}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline"
      >
        {url}
      </Link>
    );

    lastIndex = matchIndex + url.length;
  }

  // Add any remaining text after the last URL
  if (lastIndex < content.length) {
    elements.push(
      <span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>
    );
  }

  return elements.length ? elements : content;
};

const TextMessageRender: React.FC<ITextMessageRenderProps> = ({
  message,
  isMessageSendByMe
}) => {
  const { activeParentMessageId } = useConversationStore();
  const isMessageIcon = message.type === EMessageType.ICON;
  const isMessageContainLink = Boolean(message.linkMetadata);
  const isMessageActive = activeParentMessageId === message.id;

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'flex size-fit flex-col overflow-hidden rounded-[inherit] max-w-full',
        {
          'max-w-[300px]': message.linkMetadata,
          'border-2 border-black dark:border-white': isMessageActive
        }
      )}
    >
      <div
        className={cn({
          'bg-blue-500 dark:bg-blue-600 text-white ':
            isMessageSendByMe && !isMessageIcon,
          'bg-[#F0F0F0] dark:bg-[#303030]':
            !isMessageSendByMe && !isMessageIcon,
          'px-3 py-2': !isMessageIcon
        })}
      >
        <p
          className={cn('text-[15px] break-all', {
            // 'break-all': isMessageContainLink,
            'text-[25px] leading-snug': isMessageIcon
          })}
        >
          {renderWithDetectUrl(message.content || '')}
        </p>
      </div>
      {message.linkMetadata && (
        <Link
          href={message.linkMetadata.url}
          className="flex w-full flex-col"
          target="_blank"
          rel="noopener noreferrer"
        >
          {message.linkMetadata.imageUrl && (
            <Image
              width={300}
              height={157}
              className="h-[157px] w-full object-cover"
              src={message.linkMetadata.imageUrl}
              alt={message.linkMetadata.title || ''}
            />
          )}
          {message.linkMetadata.title && (
            <div className="w-full bg-[#F0F0F0] p-3 dark:bg-[#303030]">
              <span className="text-[15px] font-semibold text-[#080809] hover:underline dark:text-white">
                {message.linkMetadata.title}
              </span>
            </div>
          )}
        </Link>
      )}
    </div>
  );
};

export default TextMessageRender;
