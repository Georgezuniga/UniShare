// backend/src/controllers/reportController.js
import { pool } from '../db.js';

// POST /api/resources/:id/reports
export async function createReport(req, res) {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const { reason, details } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'El motivo del reporte es obligatorio' });
    }

    const insert = await pool.query(
      `INSERT INTO resource_reports (resource_id, user_id, reason, details)
       VALUES ($1, $2, $3, $4)
       RETURNING id, resource_id, user_id, reason, details, created_at`,
      [resourceId, userId, reason.trim(), details?.trim() || null]
    );

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('Error al crear reporte:', err);
    return res.status(500).json({ message: 'Error al crear reporte' });
  }
}

// GET /api/resources/:id/reports (solo admin)
export async function listReportsByResource(req, res) {
  try {
    const resourceId = parseInt(req.params.id, 10);

    const result = await pool.query(
      `SELECT
         rr.id,
         rr.reason,
         rr.details,
         rr.created_at,
         u.full_name AS user_full_name,
         u.email AS user_email
       FROM resource_reports rr
       JOIN users u ON u.id = rr.user_id
       WHERE rr.resource_id = $1
       ORDER BY rr.created_at DESC`,
      [resourceId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Error al listar reportes:', err);
    return res.status(500).json({ message: 'Error al obtener reportes' });
  }
}
