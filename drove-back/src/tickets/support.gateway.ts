import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ namespace: '/support', cors: true })
export class SupportGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {}

  handleConnection(client: Socket) {
    try {
      const auth = (client.handshake.headers['authorization'] || client.handshake.headers['Authorization']) as string | undefined;
      if (!auth) return client.disconnect(true);
      const parts = auth.split(' ');
      if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) return client.disconnect(true);
      const token = parts[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      (client.data as any).user = {
        id: decoded.sub ?? decoded.id,
        role: decoded.role,
        email: decoded.email,
      };
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('support:join')
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: { ticketId: string }) {
    if (!payload?.ticketId) return;
    const room = `ticket:${payload.ticketId}`;
    await client.join(room);
  }

  @SubscribeMessage('support:leave')
  async onLeave(@ConnectedSocket() client: Socket, @MessageBody() payload: { ticketId: string }) {
    if (!payload?.ticketId) return;
    const room = `ticket:${payload.ticketId}`;
    await client.leave(room);
  }

  emitMessage(ticketId: string, message: any) {
    const room = `ticket:${ticketId}`;
    this.server.to(room).emit('support:message', message);
  }

  emitStatus(ticketId: string, status: string) {
    const room = `ticket:${ticketId}`;
    this.server.to(room).emit('support:status', { status });
  }

  emitClosed(ticketId: string) {
    const room = `ticket:${ticketId}`;
    this.server.to(room).emit('support:closed', { ticketId });
  }
}


