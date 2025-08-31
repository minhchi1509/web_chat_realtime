import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { Server } from 'socket.io';

export interface SocketEmitEvent {
  socketIds: string[];
  eventName: string;
  data: any;
}

@Injectable()
export class SocketEventEmitterService {
  private socketServer: Server;
  private eventEmitter = new Subject<SocketEmitEvent>();

  constructor() {
    // Subscribe to events
    this.eventEmitter.subscribe((event) => {
      if (this.socketServer) {
        this.socketServer.to(event.socketIds).emit(event.eventName, event.data);
      }
    });
  }

  setServer(server: Server) {
    this.socketServer = server;
  }

  emitToSockets(socketIds: string[], eventName: string, data: any) {
    this.eventEmitter.next({
      socketIds,
      eventName,
      data
    });
  }
}
