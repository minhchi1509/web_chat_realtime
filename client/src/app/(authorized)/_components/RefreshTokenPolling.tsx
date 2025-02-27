'use client';
import { useMutation } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { refreshToken } from 'src/actions/auth.actions';
import { executeServerAction } from 'src/utils/common.util';

const RefreshTokenPolling = () => {
  const [accessTokenRemainingTime, setAccessTokenRemainingTime] = useState<
    number | null
  >(null);
  const { data: session, update: updateSession } = useSession();

  const { isPending: isUpdatingToken, mutate: updateToken } = useMutation({
    mutationFn: async () => {
      const newToken = await executeServerAction(() =>
        refreshToken({
          body: { refreshToken: session!.user.mainProfile.refreshToken }
        })
      );
      return newToken;
    },
    onSuccess: async (newToken) => {
      await updateSession({
        user: {
          ...session!.user,
          mainProfile: {
            ...session!.user.mainProfile,
            accessToken: newToken.accessToken,
            expiresIn: newToken.expiresIn,
            refreshToken: newToken.refreshToken
          }
        }
      });
      console.log('✅✅✅✅Update token');
    },
    onError: async () => {
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isUpdatingToken) {
      timer = setInterval(() => {
        const userMainProfile = session!.user.mainProfile;
        const accessTokenExpiredRemainingTime = Math.round(
          userMainProfile.expiresIn - 30 * 1000 - Date.now()
        );
        setAccessTokenRemainingTime(
          Math.max(accessTokenExpiredRemainingTime, 0)
        );
      }, 10 * 1000);
    }

    return () => clearInterval(timer);
  }, [session, isUpdatingToken]);

  useEffect(() => {
    console.log('Interval time', accessTokenRemainingTime);
    const shouldRefreshToken =
      accessTokenRemainingTime !== null &&
      accessTokenRemainingTime <= 0 &&
      !isUpdatingToken;

    if (shouldRefreshToken) {
      updateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessTokenRemainingTime]);
  return null;
};

export default RefreshTokenPolling;
