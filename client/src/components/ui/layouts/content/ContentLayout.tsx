import { FC, PropsWithChildren } from 'react';

import useAuthLayout from 'src/hooks/useAuthLayout';
import { cn } from 'src/utils/common.util';

const ContentLayout: FC<PropsWithChildren> = ({ children }) => {
  const { isDisplayHeader } = useAuthLayout();
  return (
    <main
      className={cn(
        'relative bg-zinc-50 dark:bg-zinc-900',
        isDisplayHeader ? 'min-h-[calc(100vh-56px)]' : 'min-h-screen'
      )}
    >
      <div className="container px-4 sm:px-8">{children}</div>
    </main>
  );
};

export default ContentLayout;
