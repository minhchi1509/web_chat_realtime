/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import { cn } from 'src/utils/common.util';

interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  dataLength: number;
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
      dataLength,
      ...props
    },
    ref
  ) => {
    const observerTargetRef = React.useRef(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage) {
            await fetchNextPage();
          }
        },
        { threshold: 1 }
      );

      if (observerTargetRef.current) {
        observer.observe(observerTargetRef.current);
      }

      return () => observer.disconnect();
    }, [hasNextPage, dataLength]);

    return (
      <div ref={ref} {...props} className={cn('scrollbar', className)}>
        {children}
        {hasNextPage && (
          <div>
            <LoadingSpinner className="size-4" />
          </div>
        )}
        <div ref={observerTargetRef} />
      </div>
    );
  }
);

InfiniteScroller.displayName = 'InfiniteScroller';
export default InfiniteScroller;
