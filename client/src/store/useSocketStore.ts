import { Socket } from 'socket.io-client';
import { create } from 'zustand';

interface ISocketStore {
  sockets: Record<string, Socket>;
  addSocket: (namespace: string, socket: Socket) => void;
  getSocket: (namespace: string) => Socket;
  removeSocket: (namespace: string) => void;
}

export const useSocketStore = create<ISocketStore>((set, get) => ({
  sockets: {},
  addSocket: (namespace, socket) =>
    set((state) => ({ sockets: { ...state.sockets, [namespace]: socket } })),
  getSocket: (namespace) => get().sockets[namespace],
  removeSocket: (namespace) =>
    set((state) => {
      const newSockets = { ...state.sockets };
      delete newSockets[namespace];
      return { sockets: newSockets };
    })
}));
