'use client';
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import CollapseMenuButton from 'src/components/ui/layouts/sidebar/CollapseMenuButton';
import LogoutButton from 'src/components/ui/layouts/sidebar/LogoutButton';
import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import { cn } from 'src/utils/common.util';
import { getGroupMenuList } from 'src/utils/sidebar-menu.util';

interface IMenuProps {
  isSidebarOpen: boolean;
}

const Menu: FC<IMenuProps> = ({ isSidebarOpen }) => {
  const pathname = usePathname();
  const groupMenuList = getGroupMenuList(pathname);

  return (
    <nav className="scrollbar mt-4 flex-1 overflow-auto pl-3 pr-2">
      <ul className="flex h-full flex-col space-y-1">
        {groupMenuList.map(({ groupLabel, menus }, index) => (
          <li className={cn(groupLabel ? 'pt-5' : '')} key={index}>
            {groupLabel &&
              (isSidebarOpen ? (
                <p className="truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                  {groupLabel}
                </p>
              ) : (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-center">
                        <Ellipsis className="size-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            <ul className="flex flex-col gap-1">
              {menus.map(
                ({ active, href, icon: Icon, label, submenus }, index) =>
                  submenus.length === 0 ? (
                    <li key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? 'secondary' : 'ghost'}
                              className={cn(
                                'h-10 w-full',
                                isSidebarOpen && 'justify-start'
                              )}
                              asChild
                            >
                              <Link href={href} className="flex gap-4">
                                <span>
                                  <Icon className="size-[18px]" />
                                </span>
                                <p
                                  className={cn(
                                    'truncate',
                                    isSidebarOpen ? 'block' : 'hidden'
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {!isSidebarOpen && (
                            <TooltipContent side="right">
                              <p>{label}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  ) : (
                    <CollapseMenuButton
                      active={active}
                      href={href}
                      icon={Icon}
                      label={label}
                      submenus={submenus}
                      key={index}
                    />
                  )
              )}
            </ul>
          </li>
        ))}
        <li className="flex w-full grow items-end">
          <LogoutButton isSidebarOpen={isSidebarOpen} />
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
