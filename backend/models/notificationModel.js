import { dbPool } from "../config/db.js";

class NotificationModel {
  static async create({ userId = null, audience, title, message, link = null }) {
    const [result] = await dbPool.execute(
      `INSERT INTO notifications (user_id, audience, title, message, link)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, audience, title, message, link]
    );
    return result.insertId;
  }

  static async findForCustomer(userId, limit = 20) {
    const [rows] = await dbPool.execute(
      `SELECT * FROM notifications WHERE user_id = ? AND audience = 'customer' ORDER BY id DESC LIMIT ${Number(limit)}`,
      [userId]
    );
    return rows;
  }

  static async findForAdmins(limit = 20) {
    const [rows] = await dbPool.execute(
      `SELECT * FROM notifications WHERE audience = 'admin' ORDER BY id DESC LIMIT ${Number(limit)}`
    );
    return rows;
  }

  static async countUnreadForCustomer(userId) {
    const [[{ count }]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND audience = 'customer' AND is_read = FALSE`,
      [userId]
    );
    return count;
  }

  static async countUnreadForAdmins() {
    const [[{ count }]] = await dbPool.execute(
      `SELECT COUNT(*) AS count FROM notifications WHERE audience = 'admin' AND is_read = FALSE`
    );
    return count;
  }

  static async markRead(id) {
    await dbPool.execute("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
  }

  static async markAllReadForCustomer(userId) {
    await dbPool.execute(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND audience = 'customer'",
      [userId]
    );
  }

  static async markAllReadForAdmins() {
    await dbPool.execute("UPDATE notifications SET is_read = TRUE WHERE audience = 'admin'");
  }
}

export default NotificationModel;
