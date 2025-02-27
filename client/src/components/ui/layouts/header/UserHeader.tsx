'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from 'src/components/ui/shadcn-ui/avatar';
import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import ConfirmDialog from 'src/components/ui/shared/dialog/ConfirmDialog';
import useSessionUser from 'src/hooks/useSessionUser';
import { cn } from 'src/utils/common.util';
import { getGroupMenuList } from 'src/utils/sidebar-menu.util';

const UserHeader = () => {
  const [openLogoutModal, setOpenLogoutModal] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const user = useSessionUser();
  const pathname = usePathname();
  const groupMenuList = getGroupMenuList(pathname);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: true, callbackUrl: '/login' });
    setIsSigningOut(false);
  };

  return (
    <>
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative size-8 rounded-full"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt="Avatar" />
                    <AvatarFallback className="bg-transparent">
                      A
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {groupMenuList.map(({ groupLabel, menus }, index) => (
            <DropdownMenuGroup key={index}>
              {groupLabel && (
                <DropdownMenuLabel>{groupLabel}</DropdownMenuLabel>
              )}
              {menus.map(
                ({ active, href, icon: Icon, label, submenus }, index) =>
                  submenus.length === 0 ? (
                    <DropdownMenuItem
                      key={index}
                      asChild
                      className={cn(active && 'bg-muted')}
                    >
                      <Link href={href} className="flex items-center">
                        <Icon className="mr-3 size-4 text-muted-foreground" />
                        <p>{label}</p>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      key={index}
                      asChild
                      className={cn(active && 'bg-muted')}
                    >
                      <Link
                        href={submenus[0].href}
                        className="flex items-center"
                      >
                        <Icon className="mr-3 size-4 text-muted-foreground" />
                        <p>{label}</p>
                      </Link>
                    </DropdownMenuItem>
                  )
              )}
            </DropdownMenuGroup>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => {
              setOpenLogoutModal(true);
            }}
          >
            <LogOut className="mr-3 size-4 text-muted-foreground" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={openLogoutModal}
        onOpenChange={setOpenLogoutModal}
        title="Confirm Logout"
        description="Are you sure you want to log out? Any unsaved changes will be lost. Please confirm to proceed."
        onConfirm={handleLogout}
        isLoading={isSigningOut}
      />
    </>
  );
};

export default UserHeader;
