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
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/support', cors: true })
export class SupportGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger('SupportGateway');

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
      this.logger.log(`Socket connected ${client.id} user=${(client.data as any).user?.id || 'unknown'}`);
    } catch {
      this.logger.warn(`Socket auth failed ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('support:join')
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: { ticketId: string }) {
    if (!payload?.ticketId) return;
    const room = `ticket:${payload.ticketId}`;
    await client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { ok: true, room };
  }

  @SubscribeMessage('support:leave')
  async onLeave(@ConnectedSocket() client: Socket, @MessageBody() payload: { ticketId: string }) {
    if (!payload?.ticketId) return;
    const room = `ticket:${payload.ticketId}`;
    await client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  emitMessage(ticketId: string, message: any) {
    const room = `ticket:${ticketId}`;
    this.server.to(room).emit('support:message', message);
    // Broadcast global para panel admin; los clientes deben filtrar por ticketId
    this.server.emit('support:message-all', { ticketId, ...message });
    // Notificaciones de no leídos (simple broadcast, el front filtra por ticket)
    this.server.emit('support:unread', { ticketId, side: String(message?.sender).toLowerCase() === 'admin' ? 'client' : 'admin' });
    this.logger.debug(`Emitted message to ${room} and global: id=${message?.id} seq=${message?.seq}`);
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


