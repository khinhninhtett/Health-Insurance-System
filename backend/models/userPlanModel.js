import { dbPool } from "../config/db.js";

const PLAN_JOIN_SELECT = `
  SELECT up.*, p.name AS plan_name, p.description AS plan_description,
         p.benefits AS plan_benefits, p.color AS plan_color,
         p.monthly_premium AS base_monthly_premium, p.annual_premium AS base_annual_premium
  FROM user_plans up
  JOIN insurance_plans p ON p.id = up.plan_id
`;

class UserPlanModel {
  static async findLatestByUserId(userId) {
    const [rows] = await dbPool.execute(
      `${PLAN_JOIN_SELECT} WHERE up.user_id = ? ORDER BY up.id DESC LIMIT 1`,
      [userId]
    );
    return rows.length ? rows[0] : null;
  }

  static async findById(id) {
    const [rows] = await dbPool.execute(`${PLAN_JOIN_SELECT} WHERE up.id = ?`, [id]);
    return rows.length ? rows[0] : null;
  }

  static async create({ userId, planId, monthlyPremium, annualPremium, coverageAmount, policyNumber }) {
    const [result] = await dbPool.execute(
      `INSERT INTO user_plans (user_id, plan_id, monthly_premium, annual_premium, coverage_amount, policy_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, planId, monthlyPremium, annualPremium, coverageAmount, policyNumber]
    );
    return this.findById(result.insertId);
  }

  static async updateStatus(id, status, { startDate = null, endDate = null } = {}) {
    await dbPool.execute(
      `UPDATE user_plans SET status = ?, start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date) WHERE id = ?`,
      [status, startDate, endDate, id]
    );
    return this.findById(id);
  }

  static async updatePremium(id, { monthlyPremium, annualPremium }) {
    await dbPool.execute(
      "UPDATE user_plans SET monthly_premium = ?, annual_premium = ? WHERE id = ?",
      [monthlyPremium, annualPremium, id]
    );
    return this.findById(id);
  }

  static async setBillingCycle(id, billingCycle) {
    await dbPool.execute("UPDATE user_plans SET billing_cycle = ? WHERE id = ?", [billingCycle, id]);
    return this.findById(id);
  }

  static async incrementCoverageUsed(id, amount) {
    await dbPool.execute(
      "UPDATE user_plans SET coverage_used = coverage_used + ? WHERE id = ?",
      [amount, id]
    );
    return this.findById(id);
  }

  // Policies the renewal scheduler must watch: anything active or suspended
  // that has an end date.
  static async findForRenewalReminders() {
    const [rows] = await dbPool.execute(
      `SELECT up.id, up.user_id, up.status, up.policy_number, up.end_date, p.name AS plan_name
       FROM user_plans up
       JOIN insurance_plans p ON p.id = up.plan_id
       WHERE up.status IN ('active', 'suspended') AND up.end_date IS NOT NULL`
    );
    return rows;
  }

  static async countActiveByPlanId(planId) {
    const [rows] = await dbPool.execute(
      "SELECT COUNT(*) AS count FROM user_plans WHERE plan_id = ? AND status = 'active'",
      [planId]
    );
    return rows[0].count;
  }

  static async findAllForAdmin() {
    const [rows] = await dbPool.execute(
      `SELECT up.*, p.name AS plan_name, u.name AS customer_name, u.email AS customer_email
       FROM user_plans up
       JOIN insurance_plans p ON p.id = up.plan_id
       JOIN users u ON u.id = up.user_id
       ORDER BY up.id DESC`
    );
    return rows;
  }
}

export default UserPlanModel;
