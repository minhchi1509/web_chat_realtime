import Image from 'next/image';
import React, { FC } from 'react';

import { cn } from 'src/utils/common.util';

interface IChatAvatarStatusProps {
  isOnline?: boolean;
  src: string;
  size: number;
  className?: string;
}

const ChatAvatarStatus: FC<IChatAvatarStatusProps> = ({
  isOnline = false,
  src,
  size,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      <Image
        src={src}
        alt="Avatar"
        width={size}
        height={size}
        className="relative aspect-square rounded-full object-cover"
      />
      {isOnline && (
        <div
          className="absolute bottom-0.5 right-0.5 rounded-full border border-white bg-green-500"
          style={{
            width: `${size / 4}px`,
            height: `${size / 4}px`
          }}
        ></div>
      )}
    </div>
  );
};

export default ChatAvatarStatus;
