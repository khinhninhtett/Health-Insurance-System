import NotificationModel from "../models/notificationModel.js";

class NotificationService {
  static async notifyCustomer(userId, title, message, link = null) {
    return NotificationModel.create({ userId, audience: "customer", title, message, link });
  }

  static async notifyAdmins(title, message, link = null) {
    return NotificationModel.create({ userId: null, audience: "admin", title, message, link });
  }

  static async getMyNotifications(user) {
    if (user.role === "admin") {
      const [notifications, unreadCount] = await Promise.all([
        NotificationModel.findForAdmins(),
        NotificationModel.countUnreadForAdmins(),
      ]);
      return { notifications, unreadCount };
    }

    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.findForCustomer(user.id),
      NotificationModel.countUnreadForCustomer(user.id),
    ]);
    return { notifications, unreadCount };
  }

  static async markRead(id) {
    await NotificationModel.markRead(id);
  }

  static async markAllRead(user) {
    if (user.role === "admin") {
      await NotificationModel.markAllReadForAdmins();
    } else {
      await NotificationModel.markAllReadForCustomer(user.id);
    }
  }
}

export default NotificationService;
