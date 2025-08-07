import { create } from 'zustand';

import { TUserResponse } from 'src/types/api/model.type';

type TSessionUserStore = {
  user: TUserResponse;
  setUser: (user: TUserResponse) => void;
  clearUser: () => void;
  getUser: () => TUserResponse;
};

const defaultUser: TUserResponse = {
  id: '',
  fullName: '',
  email: '',
  avatar: '',
  isEnableTwoFactorAuth: false
};

export const useSessionUserStore = create<TSessionUserStore>((set, get) => ({
  user: defaultUser,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: defaultUser }),

  getUser: () => get().user
}));
