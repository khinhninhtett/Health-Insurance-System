import { dbPool } from "../config/db.js";

class MedicalVerificationModel {
  static async create({ userPlanId, age, heightCm, weightKg, bmi, bloodPressure, heartRate, bloodGroup, hasChronicDisease, smoker, medicalRecordPath }) {
    const [result] = await dbPool.execute(
      `INSERT INTO medical_verifications
       (user_plan_id, age, height_cm, weight_kg, bmi, blood_pressure, heart_rate, blood_group, has_chronic_disease, smoker, medical_record_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userPlanId, age, heightCm, weightKg, bmi, bloodPressure, heartRate, bloodGroup, !!hasChronicDisease, !!smoker, medicalRecordPath]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await dbPool.execute("SELECT * FROM medical_verifications WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  static async findLatestByUserPlanId(userPlanId) {
    const [rows] = await dbPool.execute(
      "SELECT * FROM medical_verifications WHERE user_plan_id = ? ORDER BY id DESC LIMIT 1",
      [userPlanId]
    );
    return rows.length ? rows[0] : null;
  }

  static async findLatestByUserId(userId) {
    const [rows] = await dbPool.execute(
      `SELECT mv.* FROM medical_verifications mv
       JOIN user_plans up ON up.id = mv.user_plan_id
       WHERE up.user_id = ?
       ORDER BY mv.id DESC LIMIT 1`,
      [userId]
    );
    return rows.length ? rows[0] : null;
  }

  static async findAllForAdmin(status) {
    const params = [];
    let where = "";
    if (status) {
      where = "WHERE mv.status = ?";
      params.push(status);
    }
    const [rows] = await dbPool.execute(
      `SELECT mv.*, u.name AS customer_name, u.email AS customer_email, up.policy_number, p.name AS plan_name
       FROM medical_verifications mv
       JOIN user_plans up ON up.id = mv.user_plan_id
       JOIN users u ON u.id = up.user_id
       JOIN insurance_plans p ON p.id = up.plan_id
       ${where}
       ORDER BY mv.id DESC`,
      params
    );
    return rows;
  }

  static async decide(id, { status, adminNote, reviewedBy }) {
    await dbPool.execute(
      `UPDATE medical_verifications
       SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, adminNote || null, reviewedBy, id]
    );
    return this.findById(id);
  }
}

export default MedicalVerificationModel;
