import { Loader2 } from 'lucide-react';
import { FC } from 'react';

import { AppLogo } from 'src/assets/icons';
import { cn } from 'src/utils/common.util';

interface ILoadingProps {
  className?: string;
  text?: string;
}

const LoadingStatus: FC<ILoadingProps> = ({ className, text = 'Loading' }) => {
  return (
    <div
      className={cn(
        'absolute inset-0 m-auto flex flex-col items-center justify-center text-xl font-bold',
        className
      )}
    >
      <AppLogo className="size-20" />

      <div className="mt-5 flex items-center justify-center">
        <span>{text}</span>
        <Loader2 className="ml-2 size-6 animate-spin" />
      </div>
    </div>
  );
};

export default LoadingStatus;
