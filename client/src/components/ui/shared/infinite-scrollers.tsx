import React from 'react';
import { useInView } from 'react-intersection-observer';

import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import { cn } from 'src/utils/common.util';

interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  fetchNextPage: () => Promise<any>;
  hasNextPage: boolean;
  loadingMessage?: React.ReactNode;
  endingMessage?: React.ReactNode;
}

const InfiniteScroller = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  (
    {
      fetchNextPage,
      hasNextPage,
      endingMessage,
      loadingMessage,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { ref: observerRef, inView } = useInView({
      threshold: 1
    });

    React.useEffect(() => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, hasNextPage]);

    return (
      <div ref={ref} {...props} className={cn('scrollbar', className)}>
        {children}
        {hasNextPage && (
          <div>
            <LoadingSpinner className="size-4" />
          </div>
        )}
        <div ref={observerRef} />
      </div>
    );
  }
);

InfiniteScroller.displayName = 'InfiniteScroller';
export default InfiniteScroller;
