import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const wsContext = host.switchToWs();
    const socketClient = wsContext.getClient<Socket>();
    const wsData = wsContext.getData();
    const pattern = wsContext.getPattern();
    const wsError = exception.getError();

    const errorMessage =
      (wsError instanceof Object ? (wsError as any)?.message : wsError) ||
      'Unknown error message';

    const errorResponse = {
      ...(wsError instanceof Object ? wsError : {}),
      clientId: socketClient.id,
      pattern,
      payload: wsData,
      message: errorMessage
    };

    socketClient.emit('ws_exception', errorResponse);
  }
}
