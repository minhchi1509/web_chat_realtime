'use client';

import { getMessaging, onMessage } from 'firebase/messaging';
import { useRouter } from 'next-nprogress-bar';
import { FC, PropsWithChildren, useEffect } from 'react';
import { toast } from 'sonner';

import { firebaseApp } from 'src/configs/firebase.config';
import { notificationService } from 'src/services';
import { useFcmTokenStore } from 'src/store/useFcmToken';
import { getFcmToken } from 'src/utils/notification.util';

const PushNotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { fcmToken, setFcmToken } = useFcmTokenStore();
  const { push } = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getFcmToken();
      if (token) {
        await notificationService.subscribeNotification({
          deviceToken: token,
          platform: 'web'
        });
        setFcmToken(token);
      }
    })();
  }, []);

  useEffect(() => {
    const setupListener = () => {
      if (!fcmToken) return;
      const messaging = getMessaging(firebaseApp);

      const unsubsribe = onMessage(messaging, (payload) => {
        console.log('Foreground push notification received:', payload);
        const launchUrl = payload.data?.launchUrl;
        const title = payload.notification?.title;
        const body = payload.notification?.body;

        if (launchUrl) {
          toast.info(title, {
            description: body,
            action: {
              label: 'Visit',
              onClick: () => {
                if (launchUrl) {
                  push(launchUrl);
                }
              }
            }
          });
        } else {
          toast.info(title, { description: body });
        }
      });

      return unsubsribe;
    };
    const unsubscribe = setupListener();
    return () => unsubscribe?.();
  }, [fcmToken, push]);

  return <>{children}</>;
};

export default PushNotificationProvider;
