import { dbPool } from "../config/db.js";

class ReminderModel {
  // Records that a reminder was sent. Returns true only the first time for a
  // given (plan, installment, type) combination — the unique key makes repeat
  // calls no-ops, so the scheduler can run as often as it likes.
  static async logOnce({ userPlanId, installmentId = 0, type }) {
    const [result] = await dbPool.execute(
      "INSERT IGNORE INTO reminder_logs (user_plan_id, installment_id, reminder_type) VALUES (?, ?, ?)",
      [userPlanId, installmentId, type]
    );
    return result.affectedRows > 0;
  }
}

export default ReminderModel;
