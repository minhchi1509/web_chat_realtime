import { ChevronLeft } from 'lucide-react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import useAuthLayout from 'src/hooks/useAuthLayout';
import { cn } from 'src/utils/common.util';

const SidebarToggle = () => {
  const { openSidebar, toggleSidebar } = useAuthLayout();

  return (
    <div className="invisible absolute -right-4 top-3 z-20 lg:visible">
      <Button
        onClick={toggleSidebar}
        className="size-8 rounded-md"
        variant="outline"
        size="icon"
      >
        <ChevronLeft
          className={cn(
            'h-4 w-4 transition-transform ease-in-out duration-700',
            openSidebar ? 'rotate-0' : 'rotate-180'
          )}
        />
      </Button>
    </div>
  );
};

export default SidebarToggle;
