import 'dotenv/config';
import { pool } from './db.js';

async function test() {
  try {
    const res = await pool.query('SELECT NOW() as now');
    console.log('Conexión OK, hora servidor:', res.rows[0].now);
  } catch (err) {
    console.error('Error al conectar a la BD:', err);
  } finally {
    await pool.end();
  }
}

test();
