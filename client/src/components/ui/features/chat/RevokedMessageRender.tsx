import React from 'react';

import { cn } from 'src/utils/common.util';

interface IRevokedMessageRenderProps {
  isMessageSendByMe: boolean;
}

const RevokedMessageRender: React.FC<IRevokedMessageRenderProps> = ({
  isMessageSendByMe
}) => {
  const revokedMessageText = isMessageSendByMe
    ? 'You unsent a message'
    : 'This message was unsent';

  return (
    <div
      className={cn(
        'px-3 py-2 border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.18)] border rounded-[inherit] size-fit'
      )}
    >
      <p className="text-[15px] italic text-[rgb(101,104,108)] dark:text-[rgb(176,179,184)]">
        {revokedMessageText}
      </p>
    </div>
  );
};

export default RevokedMessageRender;
