import { pool } from '../db.js';

/**
 * GET /api/resources/:id/rating
 * Obtiene rating promedio + rating del usuario logueado
 */
export async function getRating(req, res) {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;

    // rating del usuario actual
    const userRatingRes = await pool.query(
      `SELECT rating
       FROM ratings
       WHERE resource_id = $1 AND user_id = $2`,
      [resourceId, userId]
    );

    // promedio general + cantidad de votos
    const avgRes = await pool.query(
      `SELECT 
          AVG(rating)::float AS average,
          COUNT(*) AS count
       FROM ratings
       WHERE resource_id = $1`,
      [resourceId]
    );

    res.json({
      average: avgRes.rows[0]?.average ?? 0,
      count: Number(avgRes.rows[0]?.count ?? 0),
      userRating: userRatingRes.rows[0]?.rating ?? null
    });
  } catch (err) {
    console.error('[Rating] Error en getRating:', err);
    res.status(500).json({ message: 'Error al obtener rating' });
  }
}

/**
 * POST /api/resources/:id/rating
 * Inserta o actualiza rating del usuario y actualiza avg_rating en resources
 */
export async function setRating(req, res) {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating inválido (1 – 5)' });
    }

    // 1) UPSERT en tabla ratings
    await pool.query(
      `
      INSERT INTO ratings (resource_id, user_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (resource_id, user_id)
      DO UPDATE SET rating = EXCLUDED.rating
      `,
      [resourceId, userId, rating]
    );

    // 2) Recalcular promedio y cantidad de votos
    const avgRes = await pool.query(
      `SELECT 
          AVG(rating)::float AS average,
          COUNT(*) AS count
       FROM ratings
       WHERE resource_id = $1`,
      [resourceId]
    );

    const average = avgRes.rows[0]?.average ?? 0;
    const count = Number(avgRes.rows[0]?.count ?? 0);

    // 3) Guardar ese promedio en resources.avg_rating
    await pool.query(
      `UPDATE resources
       SET avg_rating = $1
       WHERE id = $2`,
      [average, resourceId]
    );

    // 4) Responder al front con la info actualizada
    res.json({
      success: true,
      average,
      count,
      userRating: rating
    });
  } catch (err) {
    console.error('[Rating] Error en setRating:', err);
    res.status(500).json({ message: 'Error al guardar rating' });
  }
}
