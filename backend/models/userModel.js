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
      "SELECT id, name, email, phone, nrc, role FROM users WHERE id = ?",
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