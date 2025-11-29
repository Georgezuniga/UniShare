// backend/src/controllers/adminController.js
import { pool } from '../db.js';

/**
 * GET /api/admin/stats/overview
 *  - total de usuarios
 *  - total de recursos
 *  - total de comentarios
 *  - rating promedio global
 */
export async function getAdminOverview(req, res, next) {
  try {
    const [usersRes, resourcesRes, commentsRes, ratingsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total_users FROM users'),
      pool.query('SELECT COUNT(*) AS total_resources FROM resources'),
      pool.query('SELECT COUNT(*) AS total_comments FROM comments'),
      pool.query('SELECT AVG(rating) AS average_rating FROM ratings')
    ]);

    const summary = {
      total_users: Number(usersRes.rows[0].total_users || 0),
      total_resources: Number(resourcesRes.rows[0].total_resources || 0),
      total_comments: Number(commentsRes.rows[0].total_comments || 0),
      average_rating: ratingsRes.rows[0].average_rating
        ? Number(ratingsRes.rows[0].average_rating)
        : null
    };

    res.json(summary);
  } catch (err) {
    console.error('[Admin] Error en getAdminOverview:', err);
    next(err);
  }
}

/**
 * GET /api/admin/stats/resources-by-course
 *  - cantidad de recursos agrupados por curso
 */
export async function getResourcesByCourse(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        course,
        COUNT(*) AS total_resources
      FROM resources
      GROUP BY course
      ORDER BY total_resources DESC, course ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('[Admin] Error en getResourcesByCourse:', err);
    next(err);
  }
}

/**
 * GET /api/admin/stats/resources-by-user
 *  - cantidad de recursos subidos por cada usuario
 */
export async function getResourcesByUser(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        COUNT(r.id) AS total_resources
      FROM users u
      LEFT JOIN resources r ON r.user_id = u.id
      GROUP BY u.id, u.full_name, u.email
      ORDER BY total_resources DESC, u.full_name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('[Admin] Error en getResourcesByUser:', err);
    next(err);
  }
}

/* Alias por si las rutas usan otros nombres (por seguridad) */
export const overview = getAdminOverview;
export const resourcesByCourse = getResourcesByCourse;
export const resourcesByUser = getResourcesByUser;
