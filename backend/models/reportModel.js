import { dbPool } from "../config/db.js";

class ReportModel {
  static async getStats() {
    const [[{ totalCustomers }]] = await dbPool.execute(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'"
    );
    const [[{ activePolicies }]] = await dbPool.execute(
      "SELECT COUNT(*) AS activePolicies FROM user_plans WHERE status = 'active'"
    );
    const [[{ pendingVerifications }]] = await dbPool.execute(
      "SELECT COUNT(*) AS pendingVerifications FROM medical_verifications WHERE status = 'pending'"
    );
    const [[{ pendingPayments }]] = await dbPool.execute(
      "SELECT COUNT(*) AS pendingPayments FROM payments WHERE status = 'pending'"
    );
    const [[{ totalClaims }]] = await dbPool.execute("SELECT COUNT(*) AS totalClaims FROM claims");
    const [[{ revenue }]] = await dbPool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments WHERE status = 'approved'"
    );
    const [[{ expenses }]] = await dbPool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS expenses FROM claims WHERE status = 'approved'"
    );

    return {
      totalCustomers,
      activePolicies,
      pendingVerifications,
      pendingPayments,
      totalClaims,
      revenue: Number(revenue),
      expenses: Number(expenses),
      profit: Number(revenue) - Number(expenses),
    };
  }

  static async getRevenueByMonth() {
    const [revenueRows] = await dbPool.execute(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS revenue
       FROM payments WHERE status = 'approved'
       GROUP BY month ORDER BY month`
    );
    const [claimRows] = await dbPool.execute(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS claims
       FROM claims WHERE status = 'approved'
       GROUP BY month ORDER BY month`
    );

    const months = new Map();
    revenueRows.forEach((r) => months.set(r.month, { month: r.month, revenue: Number(r.revenue), claims: 0 }));
    claimRows.forEach((r) => {
      const existing = months.get(r.month) || { month: r.month, revenue: 0, claims: 0 };
      existing.claims = Number(r.claims);
      months.set(r.month, existing);
    });

    return Array.from(months.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({ ...m, profit: m.revenue - m.claims }));
  }

  static async getCustomerGrowthByMonth() {
    const [rows] = await dbPool.execute(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS customers
       FROM users WHERE role = 'customer'
       GROUP BY month ORDER BY month`
    );
    return rows.map((r) => ({ month: r.month, customers: Number(r.customers) }));
  }

  static async getPlanDistribution() {
    const [rows] = await dbPool.execute(
      `SELECT p.name, COUNT(*) AS value
       FROM user_plans up
       JOIN insurance_plans p ON p.id = up.plan_id
       WHERE up.status = 'active'
       GROUP BY p.name`
    );
    return rows.map((r) => ({ name: r.name, value: Number(r.value) }));
  }
}

export default ReportModel;
