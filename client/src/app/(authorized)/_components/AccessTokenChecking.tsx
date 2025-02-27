'use client';
import { signOut, useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect, useState } from 'react';

import { refreshToken } from 'src/actions/auth.actions';
import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import { executeServerAction } from 'src/utils/common.util';

const AccessTokenChecking = ({ children }: PropsWithChildren) => {
  const { data: session, update: updateSession } = useSession();
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  const handleUpdateAccessToken = async () => {
    try {
      const newToken = await executeServerAction(() =>
        refreshToken({
          body: { refreshToken: session?.user?.mainProfile.refreshToken || '' }
        })
      );
      await updateSession({
        user: {
          ...session?.user,
          mainProfile: {
            ...session?.user?.mainProfile,
            accessToken: newToken.accessToken,
            expiresIn: newToken.expiresIn,
            refreshToken: newToken.refreshToken
          }
        }
      });
      console.log('✅✅✅✅Update token');
    } catch (error) {
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
  };

  useEffect(() => {
    (async () => {
      if (!isFirstLoad) {
        return;
      }
      if (session?.user.mainProfile) {
        const remainingTime = Math.round(
          session.user.mainProfile.expiresIn - 30 * 1000 - Date.now()
        );
        if (remainingTime <= 0) {
          await handleUpdateAccessToken();
          console.log('Need to update token and update success');
        }
        console.log('No need to update token');
        setIsFirstLoad(false);
        setIsCheckingToken(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isFirstLoad]);

  return isCheckingToken ? <LoadingStatus /> : children;
};

export default AccessTokenChecking;
