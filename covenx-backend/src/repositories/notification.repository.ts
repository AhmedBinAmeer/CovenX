import { BaseRepository } from './base.repository.js';
import { NotificationModel, INotification } from '../models/Notification.model.js';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(NotificationModel);
  }

  async findByUser(userId: string): Promise<INotification[]> {
    return await this.model.find({ recipientId: userId }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await this.model.findByIdAndUpdate(notificationId, { isRead: true }, { new: true }).exec();
  }
}
