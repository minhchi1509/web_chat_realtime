'use client';
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState
} from 'react';

import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import { userService } from 'src/services';
import { useSessionUserStore } from 'src/store/useSessionUserStore';

const ProtectedRoutes: FC<PropsWithChildren> = ({ children }) => {
  const [isCheckingUserSession, setIsCheckingUserSession] = useState(true);
  const { setUser } = useSessionUserStore();

  const getUserSession = useCallback(async () => {
    try {
      const userData = await userService.getUserProfile();
      setUser(userData);
    } catch (error) {
    } finally {
      setIsCheckingUserSession(false);
    }
  }, []);

  useEffect(() => {
    getUserSession();
  }, []);

  return isCheckingUserSession ? <LoadingStatus /> : <>{children}</>;
};
export default ProtectedRoutes;
