'use client';
import React, { PropsWithChildren } from 'react';

import ChatSocketListener from 'src/components/socket-listener/ChatSocketListener';

const ChatPageLayout = ({ children }: PropsWithChildren) => {
  return <ChatSocketListener>{children}</ChatSocketListener>;
};

export default ChatPageLayout;
