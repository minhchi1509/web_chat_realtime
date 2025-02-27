import { Loader2 } from 'lucide-react';
import React, { FC } from 'react';

import { cn } from 'src/utils/common.util';

interface ILoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: FC<ILoadingSpinnerProps> = ({ className }) => {
  return <Loader2 className={cn('mx-auto size-6 animate-spin', className)} />;
};

export default LoadingSpinner;
