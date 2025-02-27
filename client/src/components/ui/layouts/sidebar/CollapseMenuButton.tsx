import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Dot } from 'lucide-react';
import Link from 'next/link';
import { FC, useState } from 'react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from 'src/components/ui/shadcn-ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from 'src/components/ui/shadcn-ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import useAuthLayout from 'src/hooks/useAuthLayout';
import { TMenu } from 'src/types/sidebar-menu.type';

interface ICollapseMenuButtonProps extends TMenu {}

const CollapseMenuButton: FC<ICollapseMenuButtonProps> = ({
  submenus,
  active,
  href,
  icon: Icon,
  label
}) => {
  const { openSidebar } = useAuthLayout();
  const isSubMenuActive = submenus.some((submenu) => submenu.active);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubMenuActive);

  return openSidebar ? (
    <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed}>
      <CollapsibleTrigger
        asChild
        className="[&[data-state=open]>div>div>svg]:rotate-180"
      >
        <Button variant="ghost" className="h-10 w-full">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <span className="mr-4">
                <Icon size={18} />
              </span>
              <p className="truncate">{label}</p>
            </div>
            <div className="whitespace-nowrap">
              <ChevronDown
                size={18}
                className="transition-transform duration-200"
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-1 flex flex-col gap-1">
          {submenus.map(({ active, href, label }, index) => (
            <Button
              key={index}
              variant={active ? 'secondary' : 'ghost'}
              className="h-10 w-full justify-start"
              asChild
            >
              <Link href={href}>
                <span className="ml-2 mr-4">
                  <Dot size={18} />
                </span>
                <p className="truncate">{label}</p>
              </Link>
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active ? 'secondary' : 'ghost'}
                className="h-10 w-full"
              >
                <Icon size={18} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent side="right" sideOffset={25} align="start">
        <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {submenus.map(({ href, label }, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link className="cursor-pointer" href={href}>
              <p className="truncate">{label}</p>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CollapseMenuButton;
