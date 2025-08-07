import axiosInstance from 'src/configs/axios.config';
import { TNotificationSubscription } from 'src/types/api/notification/subscription.type';

export const subscribeNotification = async (
  body: TNotificationSubscription
) => {
  const { data } = await axiosInstance.post(
    '/api/v1/notification/subscribe',
    body
  );
  return data;
};

export const unsubscribeNotification = async (
  body: TNotificationSubscription
) => {
  const { data } = await axiosInstance.post(
    '/api/v1/notification/unsubscribe',
    body
  );
  return data;
};
