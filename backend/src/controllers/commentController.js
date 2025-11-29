import { pool } from '../db.js';

// GET /api/resources/:id/comments
export async function listComments(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at,
              u.full_name AS user_name
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.resource_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar comentarios' });
  }
}

// POST /api/resources/:id/comments
export async function addComment(req, res) {
  try {
    const { id } = req.params; // resource_id
    const { content } = req.body;
    const userId = req.user?.id || null;

    if (!content) {
      return res.status(400).json({ message: 'Falta el contenido del comentario' });
    }

    const result = await pool.query(
      `INSERT INTO comments (resource_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al agregar comentario' });
  }
}
