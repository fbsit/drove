import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: Partial<Notification>) {
    const entity = this.repo.create(createNotificationDto as any);
    const saved: Notification = await this.repo.save(entity as any);
    // Emitir por socket centralizado según destino (evitar duplicados)
    if (saved.userId) {
      this.gateway.emitToUser(saved.userId, 'notification:new', saved);
    } else if (saved.roleTarget && saved.roleTarget !== 'ALL') {
      this.gateway.emitToRole(String(saved.roleTarget), 'notification:new', saved);
    } else {
      this.gateway.emitToAll('notification:new', saved);
    }
    return saved;
  }

  async findAllForUser(userId: string, role: string) {
    return this.repo.find({
      where: [
        { userId },
        { roleTarget: role.toUpperCase() as any },
        { roleTarget: 'ALL' as any },
      ] as any,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async countUnreadForUser(userId: string, role: string) {
    return this.repo.count({
      where: [
        { userId, read: false },
        { roleTarget: role.toUpperCase() as any, read: false },
        { roleTarget: 'ALL' as any, read: false },
      ] as any,
    });
  }

  async markAsRead(id: string) {
    await this.repo.update({ id }, { read: true });
    return true;
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return true;
  }
}
