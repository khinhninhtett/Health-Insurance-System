import { dbPool } from "../config/db.js";

class SearchModel {
  static async searchAll(query) {
    const like = `%${query}%`;

    const [customers] = await dbPool.execute(
      `SELECT id, name, email, nrc FROM users
       WHERE role = 'customer' AND (name LIKE ? OR email LIKE ? OR nrc LIKE ?)
       ORDER BY id DESC LIMIT 5`,
      [like, like, like]
    );

    const [plans] = await dbPool.execute(
      `SELECT id, name, monthly_premium FROM insurance_plans
       WHERE name LIKE ? ORDER BY id DESC LIMIT 5`,
      [like]
    );

    const [payments] = await dbPool.execute(
      `SELECT pay.id, pay.transaction_id, pay.amount, pay.status, u.name AS customer_name
       FROM payments pay
       JOIN users u ON u.id = pay.user_id
       WHERE pay.transaction_id LIKE ? OR u.name LIKE ?
       ORDER BY pay.id DESC LIMIT 5`,
      [like, like]
    );

    const [claims] = await dbPool.execute(
      `SELECT c.id, c.type, c.hospital_name, c.status, u.name AS customer_name
       FROM claims c
       JOIN users u ON u.id = c.user_id
       WHERE c.type LIKE ? OR c.hospital_name LIKE ? OR u.name LIKE ?
       ORDER BY c.id DESC LIMIT 5`,
      [like, like, like]
    );

    return { customers, plans, payments, claims };
  }
}

export default SearchModel;
