import { Controller, Get, Put, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async list(@Request() req) {
    return this.notificationsService.listForUser(req.user.id, req.user.role);
  }

  @Put('admin/mark-all-unread')
  async markAllUnread(@Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.notificationsService.markAllUnreadForAdmin();
  }

  @Put(':id/read')
  async markRead(@Param('id') id: string, @Request() req) {
    const notification = await this.notificationsService.markRead(+id);
    if (!notification) return null;
    if (notification.userId && notification.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    return notification;
  }

  @Put(':id/unread')
  async markUnread(@Param('id') id: string, @Request() req) {
    const notification = await this.notificationsService.markUnread(+id);
    if (!notification) return null;
    if (notification.userId && notification.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    return notification;
  }
}
