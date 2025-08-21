// src/travels/travels.gateway.ts
import { forwardRef, Inject, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TravelsService } from './travels.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class TravelsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TravelsGateway.name);

  constructor(
    @Inject(forwardRef(() => TravelsService))
    private readonly travelsSvc: TravelsService,
  ) {}

  handleConnection(client: Socket): void {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(`drover:${userId}`);
      this.logger.debug(`Drover ${userId} conectado`);
    }
  }

  /** drover → server */
  @SubscribeMessage('travel.response')
  async onTravelResponse(
    @MessageBody() body: { travelId: string; accept: boolean },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const droverId = client.handshake.auth?.userId;
    if (!droverId) return;

    const result = await this.travelsSvc.handleDroverResponse(
      droverId,
      body.travelId,
      body.accept,
    );

    client.emit('travel.response.result', result);
  }

  /* helper para el servicio */
  emitOffer(travelId: string, droverIds: string[]): void {
    droverIds.forEach((id) =>
      this.server.to(`drover:${id}`).emit('travel.offer', { travelId }),
    );
  }

  notifyAdmin(travelId: string, payload: any): void {
    this.server.to('admins').emit('travel.update', { travelId, ...payload });
  }
}
