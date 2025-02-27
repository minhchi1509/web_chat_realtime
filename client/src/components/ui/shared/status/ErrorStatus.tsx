import { FC } from 'react';

import { WarningIcon } from 'src/assets/icons';
import { cn } from 'src/utils/common.util';

interface IErrorStatusProps {
  className?: string;
}

const ErrorStatus: FC<IErrorStatusProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'absolute inset-0 m-auto flex flex-col items-center justify-center',
        className
      )}
    >
      <WarningIcon className="size-20" />
      <p className="mt-6 text-4xl font-semibold">Something went wrong !</p>
      <p className="mt-3 font-medium text-muted-foreground">
        Please refresh page to load data
      </p>
    </div>
  );
};

export default ErrorStatus;
