import { FC, PropsWithChildren } from 'react';

import { Card, CardContent } from 'src/components/ui/shadcn-ui/card';
import { cn } from 'src/utils/common.util';

interface IPlayholderContentProps extends PropsWithChildren {
  id?: string;
  className?: string;
  cardContentClassName?: string;
}

const PlayholderContent: FC<IPlayholderContentProps> = ({
  children,
  className,
  cardContentClassName,
  id
}) => {
  return (
    <Card className={cn('rounded-lg border-none', className)} id={id}>
      <CardContent className={cn('p-6 ', cardContentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

export default PlayholderContent;
