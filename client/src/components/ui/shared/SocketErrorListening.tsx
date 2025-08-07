import { HttpStatusCode } from 'axios';
import React, { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

import { TWsErrorResponse } from 'src/types/error-response.type';

interface ISocketErrorListeningProps extends PropsWithChildren {
  socketInstances: Socket;
}

const socketErrorEvents = ['connect_error', 'ws_exception'];

interface FailedEvent {
  event: string;
  payload: any;
}

const SocketErrorListening: FC<ISocketErrorListeningProps> = ({
  socketInstances,
  children
}) => {
  const failedEvents = useRef<FailedEvent[]>([]);
  const isReconnecting = useRef<boolean>(false);

  const handleReconnectSocket = async () => {
    isReconnecting.current = true;

    socketInstances.disconnect();
    socketInstances.connect();

    failedEvents.current.forEach(({ event, payload }) => {
      socketInstances.emit(event, payload);
    });

    failedEvents.current = [];
    isReconnecting.current = false;
  };

  // Handle socket error events
  useEffect(() => {
    socketErrorEvents.forEach((event) => {
      socketInstances.on(event, (err: TWsErrorResponse) => {
        if (err && err.errorCode === HttpStatusCode.Unauthorized) {
          failedEvents.current.push({
            event: err.pattern,
            payload: err.payload
          });
          if (!isReconnecting.current) {
            handleReconnectSocket();
          }
        }
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
