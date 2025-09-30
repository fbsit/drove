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
      // Soporta token via headers Authorization: Bearer <token>, via handshake.auth.token o via query ?token=
      const headerAuth = (client.handshake.headers['authorization'] || client.handshake.headers['Authorization']) as string | undefined;
      const authToken = (client.handshake.auth && (client.handshake.auth as any).token) as string | undefined;
      const queryToken = (client.handshake.query && (client.handshake.query['token'] as string)) as string | undefined;
      let token: string | undefined;
      if (headerAuth && typeof headerAuth === 'string') {
        const parts = headerAuth.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) token = parts[1];
      }
      if (!token && authToken) token = authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;
      if (!token && queryToken) token = queryToken.startsWith('Bearer ') ? queryToken.split(' ')[1] : queryToken;
      if (!token) return client.disconnect(true);
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
    // También emitir a admins globalmente si es necesario (namespace listeners sin sala)
    this.server.emit('support:message-admin', { ticketId, ...message });
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


