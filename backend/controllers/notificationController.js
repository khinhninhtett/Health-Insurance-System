import NotificationService from "../services/notificationService.js";

export const getMyNotifications = async (req, res) => {
  try {
    const { notifications, unreadCount } = await NotificationService.getMyNotifications(req.user);
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    await NotificationService.markRead(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await NotificationService.markAllRead(req.user);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
