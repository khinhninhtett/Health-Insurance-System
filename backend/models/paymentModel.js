import { dbPool } from "../config/db.js";

class PaymentModel {
  static async create({ userId, userPlanId, installmentId = null, method, transactionId, amount, billingCycle, receiptPath }) {
    const [result] = await dbPool.execute(
      `INSERT INTO payments (user_id, user_plan_id, installment_id, method, transaction_id, amount, billing_cycle, receipt_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userPlanId, installmentId, method, transactionId, amount, billingCycle, receiptPath]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await dbPool.execute("SELECT * FROM payments WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  static async updateStatus(id, { status, reason }) {
    await dbPool.execute("UPDATE payments SET status = ?, reason = ? WHERE id = ?", [status, reason || null, id]);
    return this.findById(id);
  }

  static async findByUserId(userId) {
    const [rows] = await dbPool.execute(
      "SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );
    return rows;
  }

  static async findAllForAdmin() {
    const [rows] = await dbPool.execute(
      `SELECT pay.*, u.name AS customer_name, p.name AS plan_name
       FROM payments pay
       JOIN users u ON u.id = pay.user_id
       JOIN user_plans up ON up.id = pay.user_plan_id
       JOIN insurance_plans p ON p.id = up.plan_id
       ORDER BY pay.id DESC`
    );
    return rows;
  }
}

export default PaymentModel;
