import 'dotenv/config';
import { pool } from './src/db.js';

async function test() {
  const result = await pool.query('SELECT NOW()');
  console.log('Conexión OK:', result.rows[0]);
}

test();
