import { getToken } from 'firebase/messaging';

import { env } from 'src/configs/env.config';
import { getFirebaseMessaging } from 'src/configs/firebase.config';

export const getFcmToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.log('Firebase messaging is not supported');
      return null;
    }
    const fcmToken = await getToken(messaging, {
      vapidKey: env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY
    });
    console.log('FCM Token:', fcmToken);
    return fcmToken;
  } else {
    console.log('Push notification permission denied');
    return null;
  }
};
