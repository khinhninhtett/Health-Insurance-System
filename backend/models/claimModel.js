import { dbPool } from "../config/db.js";

class ClaimModel {
  static async create({ userId, userPlanId, hospitalName, type, serviceDate, amount, description, documentPath }) {
    const [result] = await dbPool.execute(
      `INSERT INTO claims (user_id, user_plan_id, hospital_name, type, service_date, amount, description, document_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userPlanId, hospitalName, type, serviceDate, amount, description, documentPath]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await dbPool.execute("SELECT * FROM claims WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  static async updateStatus(id, { status, reason }) {
    await dbPool.execute("UPDATE claims SET status = ?, reason = ? WHERE id = ?", [status, reason || null, id]);
    return this.findById(id);
  }

  static async findByUserId(userId) {
    const [rows] = await dbPool.execute(
      `SELECT c.* FROM claims c
       WHERE c.user_id = ?
       ORDER BY c.id DESC`,
      [userId]
    );
    return rows;
  }

  static async findAllForAdmin() {
    const [rows] = await dbPool.execute(
      `SELECT c.*, u.name AS customer_name, up.policy_number
       FROM claims c
       JOIN users u ON u.id = c.user_id
       JOIN user_plans up ON up.id = c.user_plan_id
       ORDER BY c.id DESC`
    );
    return rows;
  }
}

export default ClaimModel;
