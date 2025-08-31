'use client';
import { AppProgressProvider } from '@bprogress/next';
import { PropsWithChildren } from 'react';

import TanstackQueryProvider from './TanstackQueryProvider';
import ThemesProvider from 'src/components/providers/ThemesProvider';
import { Toaster } from 'src/components/ui/shadcn-ui/sonner';

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AppProgressProvider
        options={{ showSpinner: false }}
        shallowRouting
        style={`.bprogress .bar {
                  position: fixed;
                  z-index: 9999;
                  top: 0;
                  left: 0;
                  width: 100%;
                  background: #29d;
                  height: 3px;
                }
                `}
      >
        <TanstackQueryProvider>{children}</TanstackQueryProvider>
      </AppProgressProvider>
      <Toaster />
    </ThemesProvider>
  );
};

export default AppProvider;
