import { Router } from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { adminRequired } from '../middleware/authMiddleware.js';
import { pool } from '../db.js';

const router = Router();

/**
 * GET /api/admin/stats/overview
 * Resumen general: usuarios, recursos, comentarios, rating promedio global
 */
router.get('/stats/overview', authRequired, adminRequired, async (req, res) => {
  try {
    const [usersRes, resourcesRes, commentsRes, avgRatingRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM resources'),
      pool.query('SELECT COUNT(*) FROM comments'),
      pool.query('SELECT AVG(avg_rating) AS average FROM resources WHERE avg_rating IS NOT NULL')
    ]);

    res.json({
      totalUsers: Number(usersRes.rows[0].count),
      totalResources: Number(resourcesRes.rows[0].count),
      totalComments: Number(commentsRes.rows[0].count),
      globalAverageRating: avgRatingRes.rows[0].average
        ? Number(avgRatingRes.rows[0].average)
        : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener overview' });
  }
});

/**
 * GET /api/admin/stats/resources-by-course
 * Cantidad de recursos por curso
 */
router.get(
  '/stats/resources-by-course',
  authRequired,
  adminRequired,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT COALESCE(course, 'Sin curso') AS course,
                COUNT(*) AS count
         FROM resources
         GROUP BY course
         ORDER BY count DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener recursos por curso' });
    }
  }
);

/**
 * GET /api/admin/stats/resources-by-user
 * Número de recursos subidos por cada usuario
 */
router.get(
  '/stats/resources-by-user',
  authRequired,
  adminRequired,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
           u.id,
           u.full_name,
           u.email,
           COUNT(r.id) AS resources_count
         FROM users u
         LEFT JOIN resources r ON r.user_id = u.id
         GROUP BY u.id, u.full_name, u.email
         ORDER BY resources_count DESC, u.full_name ASC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener recursos por usuario' });
    }
  }
);

export default router;
