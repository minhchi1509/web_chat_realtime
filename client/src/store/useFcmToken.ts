import { create } from 'zustand';

interface IFcmTokenStore {
  fcmToken: string;
  setFcmToken: (fcmToken: string) => void;
  getFcmtoken: () => string;
}

export const useFcmTokenStore = create<IFcmTokenStore>((set, get) => ({
  fcmToken: '',
  setFcmToken: (token: string) => set(() => ({ fcmToken: token })),
  getFcmtoken: () => get().fcmToken
}));
