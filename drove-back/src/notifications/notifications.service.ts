import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(createNotificationDto: Partial<Notification>) {
    const entity = this.repo.create(createNotificationDto as any);
    return this.repo.save(entity);
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
