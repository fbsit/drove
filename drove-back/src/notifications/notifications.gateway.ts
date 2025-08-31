import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket): void {
    const role = client.handshake.auth?.role as string | undefined;
    const userId = client.handshake.auth?.userId as string | undefined;
    if (role) client.join(`role:${role.toUpperCase()}`);
    if (userId) client.join(`user:${userId}`);
    this.logger.debug(`Socket connected: role=${role} user=${userId}`);
  }

  emitToRole(role: string, event: string, payload: any) {
    this.server.to(`role:${role.toUpperCase()}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}


