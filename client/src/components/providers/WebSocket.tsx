import React, { PropsWithChildren, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import SocketErrorListening from 'src/components/ui/shared/SocketErrorListening';
import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import useSessionUser from 'src/hooks/useSessionUser';
import { useSocketStore } from 'src/hooks/zustand/useSocketStore';

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
  const user = useSessionUser();
  const url = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!socket) {
      const accessToken = user.accessToken;
      const newSocket = io(`${url}${namespace}`, {
        extraHeaders: { Authorization: `Bearer ${accessToken}` }
      });
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
  }, [
    namespace,
    socket,
    addSocket,
    removeSocket,
    url,
    user,
    onSocketUnmounted
  ]);

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
