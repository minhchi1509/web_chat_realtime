'use client';
import { FC, PropsWithChildren } from 'react';

import AccessTokenChecking from 'src/app/(authorized)/_components/AccessTokenChecking';
import RefreshTokenPolling from 'src/app/(authorized)/_components/RefreshTokenPolling';
import AuthLayoutProvider from 'src/components/providers/AuthLayoutProvider';
import WebSocket from 'src/components/providers/WebSocket';

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AccessTokenChecking>
      <WebSocket namespace="/chat">
        <AuthLayoutProvider>
          {children}
          <RefreshTokenPolling />
        </AuthLayoutProvider>
      </WebSocket>
    </AccessTokenChecking>
  );
};

export default AuthLayout;
