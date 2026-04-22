import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async listForUser(userId: number, role: string): Promise<Notification[]> {
    if (role === 'admin') {
      return this.notificationRepository.find({
        where: [{ targetRole: 'admin' }, { targetRole: 'all' }],
        order: { createdAt: 'DESC' },
      });
    }

    return this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orWhere('notification.targetRole = :role', { role })
      .orWhere('notification.targetRole = :allRole', { allRole: 'all' })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  /** Marks every admin-inbox notification as unread (admin and broadcast rows). */
  async markAllUnreadForAdmin(): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update({ targetRole: In(['admin', 'all']) }, { isRead: false });
    return { updated: result.affected ?? 0 };
  }

  async markRead(id: number): Promise<Notification | null> {
    await this.notificationRepository.update(id, { isRead: true });
    return this.notificationRepository.findOne({ where: { id } });
  }

  async markUnread(id: number): Promise<Notification | null> {
    await this.notificationRepository.update(id, { isRead: false });
    return this.notificationRepository.findOne({ where: { id } });
  }
}
