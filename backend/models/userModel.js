import { dbPool } from "../config/db.js";

class UserModel {
  // Find user by email
  static async findByEmail(email) {
    const [rows] = await dbPool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return rows.length ? rows[0] : null;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await dbPool.execute(
      `SELECT id, name, email, phone, nrc, role,
              nrc_front_photo_path, nrc_back_photo_path, profile_photo_path,
              date_of_birth, address, verification_status
       FROM users WHERE id = ?`,
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  // Create new user
  static async create({ name, email, phone, nrc, password, role }) {
    const [result] = await dbPool.execute(
      `INSERT INTO users
      (name, email, phone, nrc, password, role)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, nrc, password, role]
    );

    return {
      id: result.insertId,
      name,
      email,
      phone,
      nrc,
      role,
    };
  }

  // Update user
  static async update(id, { name, phone }) {
    await dbPool.execute(
      `UPDATE users
       SET name = ?, phone = ?
       WHERE id = ?`,
      [name, phone, id]
    );

    return this.findById(id);
  }

  // Persist verification submission results
  static async updateVerification(id, { nrcFrontPhotoPath, nrcBackPhotoPath, profilePhotoPath, dateOfBirth, address, verificationStatus }) {
    await dbPool.execute(
      `UPDATE users
       SET nrc_front_photo_path = ?, nrc_back_photo_path = ?, profile_photo_path = ?,
           date_of_birth = ?, address = ?, verification_status = ?
       WHERE id = ?`,
      [nrcFrontPhotoPath, nrcBackPhotoPath, profilePhotoPath, dateOfBirth, address, verificationStatus, id]
    );

    return this.findById(id);
  }

  // List customers with their latest enrollment status, for the admin panel
  static async findAllCustomersForAdmin() {
    const [rows] = await dbPool.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.nrc, u.date_of_birth, u.address,
              u.verification_status, u.createdAt,
              latest.status AS plan_status, latest.policy_number, latest.plan_name
       FROM users u
       LEFT JOIN (
         SELECT up1.user_id, up1.status, up1.policy_number, p.name AS plan_name
         FROM user_plans up1
         JOIN insurance_plans p ON p.id = up1.plan_id
         WHERE up1.id = (SELECT MAX(up2.id) FROM user_plans up2 WHERE up2.user_id = up1.user_id)
       ) latest ON latest.user_id = u.id
       WHERE u.role = 'customer'
       ORDER BY u.id DESC`
    );
    return rows;
  }

  // Delete user
  static async delete(id) {
    const [result] = await dbPool.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default UserModel;