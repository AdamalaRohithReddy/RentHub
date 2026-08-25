import { api } from '../api/client';

export const notificationService = {
  getNotifications: () => api.getNotifications(),
  getUnreadCount: () => api.getUnreadCount(),
  markAsRead: (id) => api.markNotificationAsRead(id),
  markAllAsRead: () => api.markAllNotificationsAsRead(),
};

export default notificationService;
