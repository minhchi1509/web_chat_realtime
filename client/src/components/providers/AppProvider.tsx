'use client';
import { SessionProvider } from 'next-auth/react';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { PropsWithChildren } from 'react';

import TanstackQueryProvider from './TanstackQueryProvider';
import ThemesProvider from 'src/components/providers/ThemesProvider';
import { Toaster } from 'src/components/ui/shadcn-ui/sonner';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ProgressBar
        options={{ showSpinner: false }}
        shallowRouting
        style={`#nprogress .bar {
                position: fixed;
                z-index: 9999;
                top: 0;
                left: 0;
                width: 100%;
                background: #29d;
                height: 3px;
              }
              `}
      />
      <Toaster />
      <TanstackQueryProvider>
        <SessionProvider>{children}</SessionProvider>
      </TanstackQueryProvider>
    </ThemesProvider>
  );
};

export default AppProvider;
