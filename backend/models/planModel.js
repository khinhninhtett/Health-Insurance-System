import { dbPool } from "../config/db.js";

class PlanModel {
  static async findAllActive() {
    const [rows] = await dbPool.execute(
      "SELECT * FROM insurance_plans WHERE status = 'active' ORDER BY monthly_premium ASC"
    );
    return rows;
  }

  static async findAllForAdmin() {
    const [rows] = await dbPool.execute(
      "SELECT * FROM insurance_plans ORDER BY monthly_premium ASC"
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await dbPool.execute(
      "SELECT * FROM insurance_plans WHERE id = ?",
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  static async create({ name, description, coverageAmount, monthlyPremium, annualPremium, benefits, color, popular }) {
    const [result] = await dbPool.execute(
      `INSERT INTO insurance_plans (name, description, coverage_amount, monthly_premium, annual_premium, benefits, color, popular)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, coverageAmount, monthlyPremium, annualPremium, JSON.stringify(benefits), color, !!popular]
    );
    return this.findById(result.insertId);
  }

  static async update(id, { name, description, coverageAmount, monthlyPremium, annualPremium, benefits, color, popular }) {
    await dbPool.execute(
      `UPDATE insurance_plans
       SET name = ?, description = ?, coverage_amount = ?, monthly_premium = ?, annual_premium = ?, benefits = ?, color = ?, popular = ?
       WHERE id = ?`,
      [name, description, coverageAmount, monthlyPremium, annualPremium, JSON.stringify(benefits), color, !!popular, id]
    );
    return this.findById(id);
  }

  static async archive(id) {
    await dbPool.execute("UPDATE insurance_plans SET status = 'archived' WHERE id = ?", [id]);
    return this.findById(id);
  }
}

export default PlanModel;
