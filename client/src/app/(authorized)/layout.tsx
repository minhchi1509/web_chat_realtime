'use client';
import { FC, PropsWithChildren } from 'react';

import ProtectedRoutes from 'src/components/ProtectedRoutes';
import AuthLayoutProvider from 'src/components/providers/AuthLayoutProvider';
import PushNotificationProvider from 'src/components/providers/PushNotificationProvider';
import WebSocket from 'src/components/providers/WebSocket';

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ProtectedRoutes>
      <PushNotificationProvider>
        <WebSocket namespace="/chat">
          <AuthLayoutProvider>{children}</AuthLayoutProvider>
        </WebSocket>
      </PushNotificationProvider>
    </ProtectedRoutes>
  );
};

export default AuthLayout;
