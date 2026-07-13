import { dbPool } from "../config/db.js";

class InstallmentModel {
  static async bulkCreate(userPlanId, rows) {
    for (const row of rows) {
      await dbPool.execute(
        `INSERT INTO installments (user_plan_id, installment_no, amount, due_date, status, payment_id, paid_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userPlanId,
          row.no,
          row.amount,
          row.dueDate,
          row.status,
          row.paymentId || null,
          row.status === "paid" ? new Date() : null,
        ]
      );
    }
    return this.findByUserPlanId(userPlanId);
  }

  static async findById(id) {
    const [rows] = await dbPool.execute("SELECT * FROM installments WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  static async findByUserPlanId(userPlanId) {
    const [rows] = await dbPool.execute(
      "SELECT * FROM installments WHERE user_plan_id = ? ORDER BY installment_no ASC",
      [userPlanId]
    );
    return rows;
  }

  static async findNextUnpaid(userPlanId) {
    const [rows] = await dbPool.execute(
      `SELECT * FROM installments
       WHERE user_plan_id = ? AND status IN ('pending', 'overdue')
       ORDER BY installment_no ASC LIMIT 1`,
      [userPlanId]
    );
    return rows.length ? rows[0] : null;
  }

  static async countOverdue(userPlanId) {
    const [rows] = await dbPool.execute(
      "SELECT COUNT(*) AS total FROM installments WHERE user_plan_id = ? AND status = 'overdue'",
      [userPlanId]
    );
    return rows[0].total;
  }

  static async markPaid(id, paymentId) {
    await dbPool.execute(
      "UPDATE installments SET status = 'paid', payment_id = ?, paid_at = NOW() WHERE id = ?",
      [paymentId, id]
    );
    return this.findById(id);
  }

  static async markOverdue(id) {
    await dbPool.execute("UPDATE installments SET status = 'overdue' WHERE id = ? AND status = 'pending'", [id]);
    return this.findById(id);
  }

  // Every unpaid installment on an active or suspended policy, with the info
  // the reminder scheduler needs to notify the customer.
  static async findUnpaidForReminders() {
    const [rows] = await dbPool.execute(
      `SELECT i.*, up.user_id, up.status AS plan_status, up.policy_number
       FROM installments i
       JOIN user_plans up ON up.id = i.user_plan_id
       WHERE i.status IN ('pending', 'overdue') AND up.status IN ('active', 'suspended')
       ORDER BY i.due_date ASC`
    );
    return rows;
  }
}

export default InstallmentModel;
