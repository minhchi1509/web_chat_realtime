import React, { FC, PropsWithChildren, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface ISocketErrorListeningProps extends PropsWithChildren {
  socketInstances: Socket;
}

const socketErrorEvents = ['connect_error', 'ws_exception'];

const SocketErrorListening: FC<ISocketErrorListeningProps> = ({
  socketInstances,
  children
}) => {
  useEffect(() => {
    socketErrorEvents.forEach((event) => {
      socketInstances.on(event, (err) => {
        console.error(`Socket error event: ${event}`, err);
      });
    });
    return () => {
      socketErrorEvents.forEach((event) => {
        socketInstances.off(event);
      });
    };
  }, [socketInstances]);

  return <>{children}</>;
};

export default SocketErrorListening;
