import Link from 'next/link';

import { AppLogo } from 'src/assets/icons';
import Menu from 'src/components/ui/layouts/sidebar/Menu';
import SidebarToggle from 'src/components/ui/layouts/sidebar/SidebarToggle';
import { Button } from 'src/components/ui/shadcn-ui/button';
import useAuthLayout from 'src/hooks/useAuthLayout';
import { cn } from 'src/utils/common.util';

const Sidebar = () => {
  const { openSidebar } = useAuthLayout();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-[21] h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300',
        openSidebar ? 'w-72' : 'w-[90px]'
      )}
    >
      <SidebarToggle />
      <div className="relative flex h-full flex-col overflow-y-auto overflow-x-hidden py-4 shadow-md dark:shadow-zinc-800">
        <Button
          variant="link"
          asChild
          className={cn(
            'transition-transform ease-in-out duration-300 mb-1',
            openSidebar ? 'translate-x-0' : 'translate-x-1'
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <AppLogo className="mr-1 size-7" />
            <h1
              className={cn(
                'font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300',
                openSidebar
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-96 opacity-0 hidden'
              )}
            >
              Web Chat
            </h1>
          </Link>
        </Button>
        <Menu isSidebarOpen={openSidebar} />
      </div>
    </aside>
  );
};

export default Sidebar;
