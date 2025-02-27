'use client';

import { MoveLeftIcon } from 'lucide-react';
import { useRouter } from 'next-nprogress-bar';
import { FC } from 'react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import { cn } from 'src/utils/common.util';

interface INotFoundStatusProps {
  className?: string;
}

const NotFoundStatus: FC<INotFoundStatusProps> = ({ className }) => {
  const { push } = useRouter();

  return (
    <div
      className={cn(
        'absolute inset-0 m-auto flex flex-col items-center justify-center',
        className
      )}
    >
      <h1 className="text-8xl font-bold tracking-wider">404</h1>
      <p className="mt-6 text-4xl font-medium">Page not found</p>
      <p className="mt-3 font-medium text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Button className="group mt-6 rounded-lg" onClick={() => push('/')}>
        <MoveLeftIcon className="mr-2 size-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
        Back to home
      </Button>
    </div>
  );
};

export default NotFoundStatus;
