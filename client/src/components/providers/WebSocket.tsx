import React, { PropsWithChildren, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import SocketErrorListening from 'src/components/ui/shared/SocketErrorListening';
import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import { env } from 'src/configs/env.config';
import { useSocketStore } from 'src/store/useSocketStore';

interface IWebSocketProps extends PropsWithChildren {
  namespace: string;
  onSocketUnmounted?: (socket: Socket) => void;
}

const WebSocket: React.FC<IWebSocketProps> = ({
  namespace,
  onSocketUnmounted,
  children
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { addSocket, removeSocket } = useSocketStore();
  const url = env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!socket) {
      const newSocket = io(`${url}${namespace}`, {
        withCredentials: true,
        autoConnect: false
      });
      newSocket.connect();
      setSocket(newSocket);
      addSocket(namespace, newSocket);
    } else if (!socket.connected) {
      socket.connect();
      addSocket(namespace, socket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        removeSocket(namespace);
        onSocketUnmounted?.(socket);
      }
    };
  }, [namespace, socket, addSocket, removeSocket, url, onSocketUnmounted]);

  return (
    <>
      {socket ? (
        <SocketErrorListening socketInstances={socket}>
          {children}
        </SocketErrorListening>
      ) : (
        <LoadingStatus />
      )}
    </>
  );
};

export default WebSocket;
