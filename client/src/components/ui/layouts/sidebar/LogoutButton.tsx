'use client';
import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next-nprogress-bar';
import { FC, useState } from 'react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'src/components/ui/shadcn-ui/tooltip';
import ConfirmDialog from 'src/components/ui/shared/dialog/ConfirmDialog';
import { notificationService, userService } from 'src/services';
import { useFcmTokenStore } from 'src/store/useFcmToken';
import { useSessionUserStore } from 'src/store/useSessionUserStore';
import { cn } from 'src/utils/common.util';

interface ILogoutButtonProps {
  isSidebarOpen: boolean;
}

const LogoutButton: FC<ILogoutButtonProps> = ({ isSidebarOpen }) => {
  const { fcmToken } = useFcmTokenStore();
  const [openLogoutModal, setOpenLogoutModal] = useState<boolean>(false);
  const { push } = useRouter();
  const { clearUser } = useSessionUserStore();

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      if (fcmToken) {
        await notificationService.unsubscribeNotification({
          deviceToken: fcmToken,
          platform: 'web'
        });
      }
      await userService.logOut();
    },
    onSuccess: () => {
      clearUser();
      push('/login');
    }
  });

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpenLogoutModal(true)}
              variant="outline"
              className="mt-5 h-10 w-full justify-center"
            >
              <span className={cn(isSidebarOpen ? 'mr-4' : '')}>
                <LogOut size={18} />
              </span>
              <p
                className={cn(
                  'whitespace-nowrap',
                  isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                )}
              >
                Sign out
              </p>
            </Button>
          </TooltipTrigger>
          {!isSidebarOpen && (
            <TooltipContent side="right">Sign out</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <ConfirmDialog
        open={openLogoutModal}
        onOpenChange={setOpenLogoutModal}
        title="Confirm Logout"
        description="Are you sure you want to log out? Any unsaved changes will be lost. Please confirm to proceed."
        onConfirm={signOut}
        isLoading={isSigningOut}
      />
    </>
  );
};

export default LogoutButton;
