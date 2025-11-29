import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './src/db.js';

async function run() {
  try {
    const plainPassword = '123456';
    const hash = await bcrypt.hash(plainPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      ['Geron Admin', 'geron@ulima.edu.pe', hash, 'admin']
    );

    console.log('Usuario insertado:', result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

run();
